<template>
  <q-page class="neutral-background">
    <ni-planning-manager :events="events" :persons="displayedAuxiliaries" @updateStartOfWeek="updateStartOfWeek"
      @createEvent="openCreationModal" @editEvent="openEditionModal" @onDrop="updateEventOnDrop"
      :filteredSectors="filteredSectors" :can-edit="canEditEvent" :personKey="personKey" :filters="activeFilters"
      @toggleAllSectors="toggleAllSectors" :eventHistories="eventHistories" ref="planningManager"
      :displayAllSectors="displayAllSectors" @toggleHistory="toggleHistory" :displayHistory="displayHistory"
      @updateFeeds="updateEventHistories" :working-stats="workingStats" @refresh="refresh" />

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent.sync="newEvent" :customers="customers"
      :creationModal="creationModal" :internalHours="internalHours" @close="closeCreationModal" :personKey="personKey"
      :activeAuxiliaries="activeAuxiliaries" @resetForm="resetCreationForm" @createEvent="validateCreationEvent"
      @deleteDocument="validateDocumentDeletion" @documentUploaded="documentUploaded" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent.sync="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="validateDocumentDeletion"
      @documentUploaded="documentUploaded" @close="closeEditionModal" @deleteEvent="validateEventDeletion"
      @deleteEventRepetition="validationDeletionEventRepetition" :personKey="personKey" @updateEvent="updateEvent" />
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import Customers from '@api/Customers';
import Events from '@api/Events';
import EventHistories from '@api/EventHistories';
import { NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';
import { INTERVENTION, NEVER, PERSON, AUXILIARY, SECTOR, COACH_ROLES } from '@data/constants';
import EventCreationModal from 'src/modules/client/components/planning/EventCreationModal';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';
import Planning from 'src/modules/client/components/planning/Planning.vue';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';

export default {
  name: 'AuxiliaryPlanning',
  mixins: [planningActionMixin],
  metaInfo: { title: 'Planning auxiliaires' },
  components: {
    'ni-planning-manager': Planning,
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
  },
  props: {
    targetedAuxiliary: { type: Object, default: null },
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
      workingStats: {},
    };
  },
  async mounted () {
    try {
      await Promise.all([this.fillFilter({ loggedUser: this.loggedUser, roleToSearch: AUXILIARY }), this.getCustomers()]);
      this.initFilters();
      await this.setInternalHours();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des personnes');
    }
  },
  watch: {
    async elementToAdd (val) {
      await this.addElementToFilter(val);
    },
    async elementToRemove (val) {
      await this.removeElementFromFilter(val);
    },
  },
  computed: {
    ...mapGetters({
      loggedUser: 'main/loggedUser',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    displayedAuxiliaries () {
      return this.auxiliaries
        .filter(aux => aux.sector &&
          (this.hasCustomerContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(aux, this.$moment(this.startOfWeek), this.endOfWeek)));
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
        .filter(f => f.type === SECTOR ||
          this.hasCustomerContractOnEvent(f, this.$moment(this.startOfWeek), this.endOfWeek) ||
          this.hasCompanyContractOnEvent(f, this.$moment(this.startOfWeek), this.endOfWeek) ||
          (this.targetedAuxiliary && f._id === this.targetedAuxiliary._id)); // add targeted auxiliary even if not active on strat of week to display future events
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
      if (this.targetedAuxiliary) {
        this.$refs.planningManager.restoreFilter([formatIdentity(this.targetedAuxiliary.identity, 'FL')]);
      } else if (COACH_ROLES.includes(this.loggedUser.role.client.name)) {
        this.addSavedTerms('Auxiliaries');
      } else {
        const userSector = this.filters.find(filter => filter.type === SECTOR && filter._id === this.loggedUser.sector);
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
        this.auxiliaries = this.filters.filter(fil => fil.type === PERSON)
          .map((aux) => {
            return this.formatAuxiliaryWithSector(aux);
          });
        this.filteredSectors = this.filters.filter(fil => fil.type === SECTOR);
        await this.refresh();
      }
    },
    updateAuxiliariesList () {
      const auxiliaries = [];
      for (const sector of this.filteredSectors) {
        const auxBySector = this.getAuxBySector(sector);
        for (let i = 0, l = auxBySector.length; i < l; i++) {
          if (!auxiliaries.some(aux => auxBySector[i]._id === aux._id)) {
            auxiliaries.push(this.formatAuxiliaryWithSector(auxBySector[i]));
          }
        }
      }
      for (const auxiliary of this.filteredAuxiliaries) {
        if (!auxiliaries.some(aux => aux._id === auxiliary._id)) {
          auxiliaries.push(this.formatAuxiliaryWithSector(auxiliary));
        }
      }

      this.auxiliaries = auxiliaries;
    },
    async refresh () {
      try {
        const params = { startDate: this.startOfWeek, endDate: this.endOfWeek, groupBy: AUXILIARY };

        if (!this.displayAllSectors) {
          this.updateAuxiliariesList();
          params.auxiliary = this.auxiliaries.map(aux => aux._id);
          params.sector = this.filteredSectors.map(sector => sector._id);
        }

        this.events = await Events.list(params);
        this.workingStats = await Events.workingStats(pick(params, ['startDate', 'endDate', 'auxiliary']));

        if (this.displayHistory) await this.getEventHistories();
      } catch (e) {
        console.error(e);
        this.events = [];
        this.workingStats = {};
      }
    },
    async getCustomers () {
      try {
        this.customers = await Customers.listWithSubscriptions();
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
          oldEventHistories = await EventHistories.list({ ...params, createdAt: lastCreatedAt });
          this.eventHistories.push(...oldEventHistories);
        } else {
          oldEventHistories = await EventHistories.list(params);
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

      if (person && !this.canCreateEvent(person, selectedDay)) {
        return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');
      }

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        address: { fullAddress: '' },
        attachment: {},
        auxiliary: person ? person._id : '',
        sector: person ? person.sector._id : sectorId,
        dates: {
          startDate: this.$moment(selectedDay).hours(8).toISOString(),
          endDate: this.$moment(selectedDay).hours(10).toISOString(),
        },
      };
      this.creationModal = true;
    },
    formatAuxiliaryWithSector (aux) {
      const sectorHistory = this.getSectorHistory(aux);
      return { ...aux, sector: sectorHistory ? sectorHistory.sector : null };
    },
    getSectorHistory (aux, sector) {
      if (!aux.sectorHistories) return null;
      const sectorHistory = aux.sectorHistories.find(sectorHistory => {
        const isSameSector = sector ? sectorHistory.sector._id === sector._id : true;
        const isStartDateBeforeEndOfWeek = this.$moment(sectorHistory.startDate).isSameOrBefore(this.endOfWeek);
        const isEndDateAfterStartOfWeek = !sectorHistory.endDate || this.$moment(sectorHistory.endDate).isSameOrAfter(this.startOfWeek);
        return isSameSector && isStartDateBeforeEndOfWeek && isEndDateAfterStartOfWeek;
      });
      return sectorHistory;
    },
    getAuxBySector (sector) {
      return this.filters.filter(aux => !!this.getSectorHistory(aux, sector));
    },
    // Filter
    async addElementToFilter (el) {
      this.$refs.planningManager.updatePlanningHeaderHeight();

      if (el.type === SECTOR) {
        this.filteredSectors.push(el);
      } else { // el = auxiliary
        if (!this.filteredAuxiliaries.some(aux => aux._id === el._id)) this.filteredAuxiliaries.push(el);
      }
      await this.refresh();
    },
    async removeElementFromFilter (el) {
      this.$refs.planningManager.updatePlanningHeaderHeight();

      if (el.type === SECTOR) {
        this.filteredSectors = this.filteredSectors.filter(sec => sec._id !== el._id);
        this.updateAuxiliariesList();
      } else { // el = auxiliary
        const auxiliary = this.auxiliaries.find(auxiliary => auxiliary._id === el._id);
        this.filteredAuxiliaries = this.filteredAuxiliaries.filter(aux => aux._id !== auxiliary._id);
        this.updateAuxiliariesList();
        if (this.auxiliaries.some(aux => aux._id === auxiliary._id)) return;
      }

      await this.updateDisplayedEventHistories();
    },
    async updateDisplayedEventHistories () {
      this.eventHistories = this.eventHistories.filter(history =>
        this.auxiliaries.some(aux => history.auxiliaries.map(a => a._id).includes(aux._id)));
      if (this.auxiliaries.length) await this.getEventHistories();
      if (this.eventHistories.length === 0) this.displayHistory = false;
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
