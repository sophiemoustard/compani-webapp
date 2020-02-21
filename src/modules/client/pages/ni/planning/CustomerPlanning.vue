<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="customers" :personKey="personKey" :can-edit="canEditEvent"
      @updateStartOfWeek="updateStartOfWeek" @editEvent="openEditionModal" @createEvent="openCreationModal"
      @onDrop="updateEventOnDrop" ref="planningManager" :filters="filters" @refresh="refresh" />

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent.sync="newEvent" :personKey="personKey"
      :creationModal="creationModal" :activeAuxiliaries="activeAuxiliaries" :customers="customers"
      @resetForm="resetCreationForm" @createEvent="validateCreationEvent" @close="closeCreationModal" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent.sync="editedEvent"
      :editionModal="editionModal" :activeAuxiliaries="activeAuxiliaries" :customers="customers" :personKey="personKey"
      @resetForm="resetEditionForm" @updateEvent="updateEvent" @close="closeEditionModal"
      @deleteEventRepetition="validationDeletionEventRepetition" @deleteEvent="validateEventDeletion" />
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import get from 'lodash/get';
import Events from '@api/Events';
import Customers from '@api/Customers';
import { NotifyNegative } from '@components/popup/notify.js';
import { formatIdentity } from '@helpers/utils';
import {
  INTERVENTION,
  DEFAULT_AVATAR,
  NEVER,
  AUXILIARY,
  PLANNING_REFERENT,
  CUSTOMER,
  SECTOR,
  COACH_ROLES,
} from 'src/core/data/constants';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';
import Planning from 'src/modules/client/components/planning/Planning.vue';
import EventCreationModal from 'src/modules/client/components/planning/EventCreationModal';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';

export default {
  name: 'CustomerPlanning',
  metaInfo: { title: 'Planning bénéficiaire' },
  mixins: [planningActionMixin],
  components: {
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
    'ni-planning-manager': Planning,
  },
  props: {
    targetedCustomer: { type: Object, default: null },
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      startOfWeek: '',
      filteredSectors: [],
      filteredCustomers: [],
      DEFAULT_AVATAR,
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
      personKey: CUSTOMER,
      sectorCustomers: [],
    };
  },
  async mounted () {
    try {
      await this.fillFilter(CUSTOMER);
      await this.getAuxiliaries();
      this.initFilters();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes');
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
    ...mapGetters({
      mainUser: 'main/user',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    endOfWeek () {
      return this.$moment(this.startOfWeek).endOf('w').toISOString();
    },
    activeAuxiliaries () {
      return this.auxiliaries
        .filter(aux => this.hasCustomerContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek));
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

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).endOf('w'));
      this.days = Array.from(range.by('days'));
      if (this.filteredSectors.length !== 0 || this.filteredCustomers.length !== 0) await this.refreshCustomers();
      if (this.customers.length !== 0) await this.refresh();
    },
    // Filters
    initFilters () {
      if (this.targetedCustomer) {
        this.$refs.planningManager.restoreFilter([formatIdentity(this.targetedCustomer.identity, 'FL')]);
      } else if (COACH_ROLES.includes(this.mainUser.role.client.name)) {
        this.addSavedTerms('Customers');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.mainUser.sector);
        if (userSector && this.$refs.planningManager) this.$refs.planningManager.restoreFilter([userSector.label]);
      }
    },
    // Refresh
    async refreshCustomers () {
      this.customers = [];
      try {
        this.sectorCustomers = await this.getSectorCustomers(this.filteredSectors);
      } catch (e) {
        this.sectorCustomers = []
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
        this.events = await Events.list({
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          customer: this.customers.map(cus => cus._id),
          groupBy: CUSTOMER,
        });
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      this.auxiliaries = await this.$users.list({ role: [AUXILIARY, PLANNING_REFERENT] });
    },
    // Event creation
    openCreationModal (vEvent) {
      const { dayIndex, person } = vEvent;
      const selectedDay = this.days[dayIndex];
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
          startDate: this.$moment(selectedDay).hours(8).toISOString(),
          endDate: this.$moment(selectedDay).hours(10).toISOString(),
        },
      };
      this.creationModal = true;
    },
    async getSectorCustomers (sectors) {
      return sectors.length === 0 ? [] : Customers.listBySector({
        startDate: this.startOfWeek,
        endDate: this.endOfWeek,
        sector: JSON.stringify(sectors),
      });
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
}
</script>

<style lang="stylus" scoped>
  .modal-subtitle
    justify-content: flex-end;
    display: flex;

  .light-checkbox
    color: $grey
    font-size: 14px

  .cancel
    padding-right: 3px;

</style>
