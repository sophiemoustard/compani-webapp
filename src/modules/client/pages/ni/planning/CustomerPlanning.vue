<template>
  <q-page class="client-background">
    <ni-planning-manager :events="events" :persons="customers" :person-key="personKey" :can-edit="canEditEvent"
      @update-start-of-week="updateStartOfWeek" @open-edition-modal="openEditionModal" ref="planningManager"
      @open-creation-modal="openCreationModal" @on-drop="updateEventOnDrop" :filters="filters"
      @refresh="refresh" @open-customer-absence-edition-modal="openCustomerAbsenceModal" />

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="eventValidation.newEvent" :new-event="newEvent" :person-key="personKey"
      :creation-modal="creationModal" :active-auxiliaries="activeAuxiliaries" :loading="loading" :customers="customers"
      @reset="resetCreationForm" @submit="validateCreationEvent" @close="closeCreationModal"
      @update-event="setEvent" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="eventValidation.editedEvent" :loading="loading" :edited-event="editedEvent"
      :edition-modal="editionModal" :active-auxiliaries="activeAuxiliaries" :customers="customers"
      @hide="resetEditionForm" @submit="validateEventEdition" @close="closeEditionModal" :person-key="personKey"
      @delete-event-repetition="validationDeletionEventRepetition" @delete-event="validateEventDeletion"
      :event-histories="editedEventHistories" :histories-loading="historiesLoading"
      @refresh-histories="refreshHistories" @update-event="setEvent" />

    <!-- Customer Absence Modal -->
    <ni-customer-absence-edition-modal v-model:edited-customer-absence="editedCustomerAbsence"
      :customer-absence-edition-modal="customerAbsenceModal" :validations="eventValidation.editedCustomerAbsence"
      @close="closeCustomerAbsenceModal" @hide="resetCustomerAbsenceEditionForm"
      @submit="validateCustomerAbsenceEdition" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref } from 'vue';
import { mapGetters, mapActions, mapState } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import set from 'lodash/set';
import groupBy from 'lodash/groupBy';
import Events from '@api/Events';
import CustomerAbsences from '@api/CustomerAbsences';
import Customers from '@api/Customers';
import Users from '@api/Users';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import {
  INTERVENTION,
  DEFAULT_AVATAR,
  NEVER,
  AUXILIARY,
  PLANNING_REFERENT,
  CUSTOMER,
  SECTOR,
  COACH_ROLES,
  CUSTOMER_ABSENCE,
} from '@data/constants';
import moment from '@helpers/moment';
import { isAfter } from '@helpers/date';
import { usePlanningAction } from 'src/modules/client/composables/planningAction';
import Planning from 'src/modules/client/components/planning/Planning';
import EventCreationModal from 'src/modules/client/components/planning/EventCreationModal';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';
import CustomerAbsenceEditionModal from 'src/modules/client/components/planning/CustomerAbsenceEditionModal';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';

export default {
  name: 'CustomerPlanning',
  mixins: [planningActionMixin],
  components: {
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
    'ni-planning-manager': Planning,
    'ni-customer-absence-edition-modal': CustomerAbsenceEditionModal,
  },
  props: {
    targetedCustomerId: { type: String, default: '' },
  },
  setup () {
    const metaInfo = { title: 'Planning bénéficiaire' };
    useMeta(metaInfo);

    const personKey = ref(CUSTOMER);
    const customers = ref([]);
    const { newEvent, editedEvent, editedCustomerAbsence, eventValidation } = usePlanningAction(personKey, customers);

    return { personKey, newEvent, editedEvent, editedCustomerAbsence, customers, eventValidation };
  },
  data () {
    return {
      loading: false,
      days: [],
      events: {},
      auxiliaries: [],
      startOfWeek: '',
      filteredSectors: [],
      filteredCustomers: [],
      DEFAULT_AVATAR,
      // Event creation
      creationModal: false,
      // Event edition
      editionModal: false,
      // Customer Absence edition
      customerAbsenceModal: false,
      sectorCustomers: [],
    };
  },
  async created () {
    try {
      await this.fillFilter({ company: this.company, roleToSearch: CUSTOMER });
      await this.getAuxiliaries();
      this.initFilters();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes.');
    }
  },
  watch: {
    async elementToAdd (val) {
      await this.addElementToFilter(val);
    },
    elementToRemove (val) {
      this.removeElementFromFilter(val);
    },
  },
  computed: {
    ...mapState('planning', ['filters', 'elementToAdd', 'elementToRemove']),
    ...mapGetters({
      company: 'main/getCompany',
      clientRole: 'main/getClientRole',
    }),
    endOfWeek () {
      return moment(this.startOfWeek).endOf('w').toISOString();
    },
    activeAuxiliaries () {
      return this.auxiliaries
        .filter(aux => this.hasContractOnEvent(aux, moment(this.startOfWeek), this.endOfWeek));
    },
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
    // Dates
    async updateStartOfWeek (vEvent) {
      const { startOfWeek } = vEvent;
      this.startOfWeek = startOfWeek;

      const range = moment.range(this.startOfWeek, moment(this.startOfWeek).endOf('w'));
      this.days = Array.from(range.by('days'));
      if (this.filteredSectors.length !== 0 || this.filteredCustomers.length !== 0) await this.refreshCustomers();
      if (this.customers.length !== 0) await this.refresh();
    },
    // Filters
    initFilters () {
      if (this.targetedCustomerId) this.$refs.planningManager.restoreFilter([this.targetedCustomerId]);
      else if (COACH_ROLES.includes(this.clientRole)) {
        this.addSavedTerms('Customers');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.loggedUser.sector);
        if (userSector && this.$refs.planningManager) this.$refs.planningManager.restoreFilter([userSector._id]);
      }
    },
    // Refresh
    async refreshCustomers () {
      this.customers = [];
      try {
        this.sectorCustomers = await this.getSectorCustomers(this.filteredSectors);
      } catch (e) {
        this.sectorCustomers = [];
      }

      for (let i = 0, l = this.sectorCustomers.length; i < l; i++) {
        if (!this.customers.some(cus => this.sectorCustomers[i]._id === cus._id)) {
          this.customers.push(this.sectorCustomers[i]);
        }
      }
      if (this.filteredCustomers.length !== 0) {
        for (let i = 0, l = this.filteredCustomers.length; i < l; i++) {
          if (!this.customers.some(cus => this.filteredCustomers[i]._id === cus._id)) {
            this.customers.push(this.filteredCustomers[i]);
          }
        }
      }
    },
    async refresh () {
      try {
        const query = {
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          customer: this.customers.map(cus => cus._id),
        };

        const interventions = await Events.list(query);
        const absences = await CustomerAbsences.list(query);

        const customerAbsences = absences.map(abs => ({ ...abs, type: CUSTOMER_ABSENCE }));
        this.events = groupBy([...interventions, ...customerAbsences], 'customer._id');
      } catch (e) {
        this.events = {};
      }
    },
    async getAuxiliaries () {
      const params = { role: [AUXILIARY, PLANNING_REFERENT] };
      const companyId = get(this.company, '_id');
      if (companyId) params.company = companyId;
      this.auxiliaries = await Users.list(params);
    },
    // Event creation
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];

      if (person.archivedAt) return NotifyNegative('La personne est archivée.');

      if (isAfter(selectedDay, person.stoppedAt)) {
        return NotifyWarning('La personne est arrêtée à cette date.');
      }

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: person._id,
        subscription: '',
        internalHour: '',
        absence: '',
        address: get(person, 'contact.primaryAddress', {}),
        attachment: {},
        auxiliary: '',
        sector: '',
        dates: {
          startDate: moment(selectedDay).set({ second: 0, millisecond: 0 }).toISOString(),
          endDate: moment(selectedDay).set({ second: 0, millisecond: 0 }).toISOString(),
          startHour: '08:00',
          endHour: '10:00',
        },
        misc: '',
      };
      this.creationModal = true;
    },
    async getSectorCustomers (sectors) {
      return sectors.length === 0
        ? []
        : Customers.listBySector({
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          sector: sectors,
        });
    },
    setEvent (payload) {
      const { path, value } = payload;
      if (this.creationModal) set(this.newEvent, path, value);
      else if (this.editionModal) set(this.editedEvent, path, value);
    },
    // Customer Absence edition
    openCustomerAbsenceModal (event) {
      const { startDate, endDate } = event;
      this.editedCustomerAbsence = {
        ...pick(event, ['_id', 'customer', 'absenceType']),
        dates: { startDate, endDate },
      };

      this.customerAbsenceModal = true;
    },
    async closeCustomerAbsenceModal () {
      this.customerAbsenceModal = false;
      await this.refresh();
    },
    resetCustomerAbsenceEditionForm () {
      this.eventValidation.editedCustomerAbsence.$reset();
      this.customerAbsenceModal = false;
    },
    formatEditedCustomerAbsence () {
      const { absenceType, dates } = this.editedCustomerAbsence;
      return { absenceType, startDate: dates.startDate, endDate: dates.endDate };
    },
    validateCustomerAbsenceEdition () {
      this.$q.dialog({
        title: 'Confirmation',
        message: `Êtes-vous sûr(e) de vouloir modifier l'absence bénéficiaire&nbsp;?<br />
          Les interventions prévues sur la période d'absence seront supprimées.`,
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.updateCustomerAbsence)
        .onCancel(() => NotifyPositive('Modification annulée.'));
    },
    async updateCustomerAbsence () {
      try {
        this.eventValidation.editedCustomerAbsence.$touch();
        if (this.eventValidation.editedCustomerAbsence.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.formatEditedCustomerAbsence();
        await CustomerAbsences.updateById(this.editedCustomerAbsence._id, payload);
        NotifyPositive('Absence modifiée');

        this.customerAbsenceModal = false;
        await this.refresh();
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification de l\'absence.');
      }
    },
    // Filter
    async addElementToFilter (el) {
      this.$refs.planningManager.updatePlanningHeaderHeight();

      if (el.type === SECTOR) {
        this.filteredSectors.push(el._id);
        this.sectorCustomers = await this.getSectorCustomers(this.filteredSectors);
        for (let i = 0, l = this.sectorCustomers.length; i < l; i++) {
          if (!this.customers.some(cus => this.sectorCustomers[i]._id === cus._id)) {
            this.customers.push(this.sectorCustomers[i]);
          }
        }
        await this.refresh();
      } else { // el = customer
        if (!this.filteredCustomers.some(cust => cust._id === el._id)) this.filteredCustomers.push(el);
        if (!this.customers.some(cust => cust._id === el._id)) {
          this.customers.push(el);
          await this.refresh();
        }
      }
    },
    async removeElementFromFilter (el) {
      this.$refs.planningManager.updatePlanningHeaderHeight();

      if (el.type === SECTOR) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec !== el._id);
        await this.refreshCustomers();
        await this.refresh();
      } else {
        this.filteredCustomers = this.filteredCustomers.filter(cus => cus._id !== el._id);
        if (!this.sectorCustomers.some(cus => cus._id === el._id)) {
          this.customers = this.customers.filter(customer => customer._id !== el._id);
        }
      }
    },
  },
};
</script>
