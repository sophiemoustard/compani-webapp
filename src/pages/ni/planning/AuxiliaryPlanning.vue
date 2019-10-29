<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="displayedAuxiliaries" @updateStartOfWeek="updateStartOfWeek"
      @createEvent="openCreationModal" @editEvent="openEditionModal" @onDrop="updateEventOnDrop"
      :filteredSectors="filteredSectors" :can-edit="canEditEvent" :personKey="personKey" :filters="activeFilters"
      @toggleAllSectors="toggleAllSectors" :eventHistories="eventHistories" ref="planningManager"
      :displayAllSectors="displayAllSectors" @toggleHistory="toggleHistory" :displayHistory="displayHistory"
      @updateFeeds="updateEventHistories" />

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent="newEvent"
      :creationModal="creationModal" :internalHours="internalHours" @close="closeCreationModal" :personKey="personKey"
      :activeAuxiliaries="activeAuxiliaries" :customers="customers" @resetForm="resetCreationForm"
      @deleteDocument="deleteDocument" @documentUploaded="documentUploaded" @createEvent="createEvent" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="deleteDocument" @updateEvent="updateEvent"
      @documentUploaded="documentUploaded" @close="closeEditionModal" @deleteEvent="deleteEvent"
      @deleteEventRepetition="deleteEventRepetition" :personKey="personKey" />
  </q-page>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import EventCreationModal from '../../../components/planning/EventCreationModal';
import EventEditionModal from '../../../components/planning/EventEditionModal';
import Planning from '../../../components/planning/Planning.vue';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { INTERVENTION, NEVER, PERSON, AUXILIARY, SECTOR, AUXILIARY_ROLES } from '../../../data/constants';
import { mapGetters, mapActions } from 'vuex';
import { NotifyNegative, NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'AuxiliaryPlanning',
  mixins: [planningActionMixin],
  metaInfo: { title: 'Plannnig auxiliaires' },
  components: {
    'ni-planning-manager': Planning,
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
  },
  data () {
    return {
      loading: false,
      days: [],
      events: [],
      customers: [],
      auxiliaries: [],
      internalHours: [],
      // Filters
      filteredSectors: [],
      filteredAuxiliaries: [],
      savedSearch: [],
      // Event creation
      newEvent: {},
      creationModal: false,
      // Event edition
      editedEvent: {},
      editionModal: false,
      startOfWeek: '',
      personKey: AUXILIARY,
      displayAllSectors: false,
      eventHistories: [],
      displayHistory: false,
    };
  },
  async mounted () {
    try {
      await Promise.all([this.fillFilter(AUXILIARY), this.getCustomers()]);
      this.initFilters();
      this.setInternalHours();
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
    displayedAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasCustomerContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek) ||
        this.hasCompanyContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek));
    },
    endOfWeek () {
      return this.$moment(this.startOfWeek).endOf('w').toISOString();
    },
    activeAuxiliaries () {
      return this.filters
        .filter(f => f.type === PERSON)
        .filter(aux => this.hasCustomerContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek));
    },
    activeFilters () {
      return this.filters
        .filter(f => f.type === SECTOR || this.hasCustomerContractOnEvent(f, this.$moment(this.startOfWeek), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(f, this.$moment(this.startOfWeek), this.endOfWeek));
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

      const range = this.$moment.range(this.startOfWeek, this.$moment(this.startOfWeek).add(6, 'd'));
      this.days = Array.from(range.by('days'));
      if (this.auxiliaries && this.auxiliaries.length) await this.refresh();
    },
    // Filters
    initFilters () {
      if (!AUXILIARY_ROLES.includes(this.mainUser.role.name)) {
        this.addSavedTerms('Auxiliaries');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.mainUser.sector);
        if (userSector && this.$refs.planningManager) this.$refs.planningManager.restoreFilter([userSector.label]);
      }
    },
    // History
    async toggleHistory (displayHistory) {
      this.displayHistory = displayHistory;
      if (displayHistory) await this.getEventHistories();
      else this.eventHistories = [];
    },
    // Refresh data
    async toggleAllSectors (search) {
      this.displayAllSectors = !this.displayAllSectors;
      if (!this.displayAllSectors) {
        this.auxiliaries = [];
        this.filteredSectors = [];
        this.events = [];
        this.$refs.planningManager.restoreFilter(this.savedSearch);
      } else {
        this.savedSearch = search;
        this.filteredAuxiliaries = [];
        this.auxiliaries = this.filters.filter(fil => fil.type === PERSON);
        this.filteredSectors = this.filters.filter(fil => fil.type === SECTOR);
        await this.refresh();
      }
    },
    async refresh () {
      try {
        let params = {
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          groupBy: AUXILIARY,
        };
        if (!this.displayAllSectors) {
          params.auxiliary = this.auxiliaries.map(aux => aux._id);
          params.sector = this.filteredSectors.map(sector => sector._id);
        }

        this.events = await this.$events.list(params);
        if (this.displayHistory) await this.updateEventHistories();
      } catch (e) {
        console.error(e);
        this.events = [];
      }
    },
    async getCustomers () {
      try {
        this.customers = await this.$customers.listWithSubscriptions();
      } catch (e) {
        console.error(e);
        this.customers = [];
      }
    },
    async getEventHistories (lastCreatedAt = null) {
      const eventHistoriesTmp = cloneDeep(this.eventHistories);
      try {
        const params = {
          sectors: this.filteredSectors.map(sector => sector._id),
          auxiliaries: this.auxiliaries.map(aux => aux._id),
        };

        let oldEventHistories;
        if (lastCreatedAt) {
          oldEventHistories = await this.$eventHistories.list({ ...params, createdAt: lastCreatedAt });
          this.eventHistories.push(...oldEventHistories);
        } else {
          oldEventHistories = await this.$eventHistories.list(params);
          this.eventHistories = oldEventHistories;
        }

        return oldEventHistories;
      } catch (e) {
        console.error(e);
        this.eventHistories = eventHistoriesTmp;
        NotifyNegative("Erreur lors de la récupération du flux d'activité");
      }
    },
    // Event creation
    openCreationModal (vEvent) {
      const { dayIndex, person, sectorId } = vEvent;
      const selectedDay = this.days[dayIndex];

      if (person && !this.canCreateEvent(person, selectedDay)) return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        address: {},
        attachment: {},
        auxiliary: person ? person._id : '',
        sector: person ? person.sector._id : sectorId,
        dates: {
          startDate: selectedDay.toISOString(),
          startHour: '08:00',
          endDate: selectedDay.toISOString(),
          endHour: '10:00',
        },
      };
      this.creationModal = true;
    },
    // Filter
    async addElementToFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors.push(el);
        const auxBySector = this.filters.filter(aux => aux.sector && aux.sector._id === el._id);
        for (let i = 0, l = auxBySector.length; i < l; i++) {
          if (!this.auxiliaries.some(aux => auxBySector[i]._id === aux._id)) {
            this.auxiliaries.push(auxBySector[i]);
          }
        }
        await this.refresh();
      } else { // el = auxiliary
        if (!this.filteredAuxiliaries.some(aux => aux._id === el._id)) this.filteredAuxiliaries.push(el);
        if (!this.auxiliaries.some(aux => aux._id === el._id)) {
          this.auxiliaries.push(el);
          await this.refresh();
        }
      }
    },
    removeElementFromFilter (el) {
      if (el.type === SECTOR) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec._id !== el._id);
        this.auxiliaries = this.auxiliaries.filter(auxiliary =>
          auxiliary.sector._id !== el._id || this.filteredAuxiliaries.some(filteredAux => filteredAux._id === auxiliary._id));
        this.eventHistories = this.eventHistories.filter(history =>
          !history.sectors.includes(el._id) ||
            this.filteredAuxiliaries.some(filteredAux => history.auxiliaries.map(aux => aux._id).includes(filteredAux._id)));
        if (this.eventHistories.length === 0) this.displayHistory = false;
      } else { // el = auxiliary
        this.filteredAuxiliaries = this.filteredAuxiliaries.filter(auxiliary => auxiliary._id !== el._id);
        if (this.filteredSectors.some(sector => sector._id === el.sector._id)) return;
        this.auxiliaries = this.auxiliaries.filter(auxiliary => auxiliary._id !== el._id);
        this.eventHistories = this.eventHistories.filter(history =>
          !history.auxiliaries.map(aux => aux._id).includes(el._id) ||
            this.filteredAuxiliaries.some(filteredAux => history.auxiliaries.map(aux => aux._id).includes(filteredAux._id)));
        if (this.eventHistories.length === 0) this.displayHistory = false;
      }
    },
    async updateEventHistories (done) {
      const lastCreatedAt = this.eventHistories.length ? this.eventHistories[this.eventHistories.length - 1].createdAt : null
      const oldEventHistories = await this.getEventHistories(lastCreatedAt);
      if (oldEventHistories.length) return done();
      done(true);
    },
  },
}
</script>
