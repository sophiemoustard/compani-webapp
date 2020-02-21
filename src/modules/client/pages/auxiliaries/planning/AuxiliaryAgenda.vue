<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-sm-5 person-name">
          <template v-if="Object.keys(selectedAuxiliary).length > 0">
            <img :src="getAvatar(selectedAuxiliary)" class="avatar">
            <ni-select :value="selectedAuxiliary._id" :options="auxiliariesOptions" @input="updateAuxiliary"
              ref="personSelect" behavior="menu" icon="swap_vert" no-error class="person-name-select" />
          </template>
        </div>
        <div class="col-xs-12 col-sm-7">
          <planning-navigation :timeline-title="timelineTitle()" :target-date="targetDate" :view-mode="viewMode"
            :type="AGENDA" @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek" @goToToday="goToToday"
            @goToWeek="goToWeek" @updateViewMode="updateViewMode" />
        </div>
      </div>
      <agenda :events="filteredEvents" :days="days" :personKey="personKey" @createEvent="openCreationModal"
        @editEvent="openEditionModal" />
    </div>

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="$v.newEvent" :loading="loading" :newEvent.sync="newEvent" :personKey="personKey"
      :creationModal="creationModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetCreationForm" @deleteDocument="validateDocumentDeletion"
      @documentUploaded="documentUploaded" @createEvent="validateCreationEvent" @close="closeCreationModal" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent.sync="editedEvent"
      :editionModal="editionModal" :internalHours="internalHours" :activeAuxiliaries="activeAuxiliaries"
      :customers="customers" @resetForm="resetEditionForm" @deleteDocument="validateDocumentDeletion"
      @documentUploaded="documentUploaded" @updateEvent="updateEvent" @deleteEvent="validateEventDeletion"
      @deleteEventRepetition="validationDeletionEventRepetition" :personKey="personKey"  @close="closeEditionModal" />
  </q-page>
</template>

<script>
import Users from '@api/Users';
import Customers from '@api/Customers';
import Events from '@api/Events';
import Select from '@components/form/Select';
import { NotifyWarning } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';
import { can } from '@helpers/can';
import { DEFAULT_AVATAR, INTERVENTION, NEVER, AGENDA, THREE_DAYS_VIEW, AUXILIARY, UNKNOWN_AVATAR, WEEK_VIEW } from 'src/core/data/constants';
import Agenda from 'src/modules/client/components/planning/Agenda';
import PlanningNavigation from 'src/modules/client/components/planning/PlanningNavigation';
import EventCreationModal from 'src/modules/client/components/planning/EventCreationModal';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';
import { planningTimelineMixin } from 'src/modules/client/mixins/planningTimelineMixin';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';

export default {
  name: 'AuxiliaryAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
    'ni-select': Select,
  },
  mixins: [planningTimelineMixin, planningActionMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      height: 0,
      selectedAuxiliary: {},
      auxiliaries: [],
      customers: [],
      internalHours: [],
      loading: false,
      viewMode: WEEK_VIEW,
      AGENDA,
      newEvent: {},
      creationModal: false,
      editedEvent: {},
      editionModal: false,
      personKey: AUXILIARY,
    };
  },
  computed: {
    placeholder () {
      if (!this.selectedAuxiliary.identity) return '';
      return formatIdentity(this.selectedAuxiliary.identity, 'FL');
    },
    currentUser () {
      return this.$store.getters['main/user'];
    },
    activeAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasCompanyContractOnEvent(aux, this.days[0], this.days[6]) ||
        this.hasCustomerContractOnEvent(aux, this.days[0], this.days[6]));
    },
    auxiliariesOptions () {
      return this.activeAuxiliaries.length === 0
        ? [{ label: this.placeholder, value: this.selectedAuxiliary._id }]
        : this.activeAuxiliaries.map(aux => ({
          label: `${aux.identity.firstname || ''} ${aux.identity.lastname}`,
          value: aux._id,
        }));
    },
    filteredEvents () {
      return this.events.filter(ev => !ev.isCancelled);
    },
  },
  async mounted () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week').toISOString();
    this.selectedAuxiliary = this.currentUser;
    this.getTimelineDays();
    await Promise.all([this.getAuxiliaries(), this.getCustomers(), this.refresh(), this.setInternalHours()]);
  },
  methods: {
    getAvatar (aux) {
      if (!aux || !aux._id) return UNKNOWN_AVATAR;

      return aux.picture && aux.picture.link ? aux.picture.link : DEFAULT_AVATAR;
    },
    async updateAuxiliary (auxiliaryId) {
      this.selectedAuxiliary = this.auxiliaries.find(aux => aux._id === auxiliaryId);
      await this.refresh();
    },
    async updateTimeline () {
      this.getTimelineDays();
      await this.refresh();
    },
    // Refresh data
    async refresh () {
      try {
        const params = {
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          auxiliary: this.selectedAuxiliary._id,
        }
        this.events = await Events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      try {
        this.auxiliaries = await Users.list();
      } catch (e) {
        this.auxiliaries = [];
      }
    },
    async getCustomers () {
      try {
        this.customers = await Customers.listWithSubscriptions();
      } catch (e) {
        this.customers = [];
      }
    },
    // Event creation
    openCreationModal (dayIndex) {
      const isAllowed = can({
        user: this.currentUser,
        auxiliaryIdEvent: this.selectedAuxiliary._id,
        permissions: [
          { name: 'events:edit' },
          { name: 'events:own:edit', rule: 'isOwner' },
        ],
      });
      if (!isAllowed) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');

      const selectedDay = this.days[dayIndex];
      if (!this.canCreateEvent(this.selectedAuxiliary, selectedDay)) return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');

      this.newEvent = {
        type: INTERVENTION,
        repetition: { frequency: NEVER },
        customer: '',
        subscription: '',
        internalHour: '',
        absence: '',
        address: {},
        attachment: {},
        auxiliary: this.selectedAuxiliary._id,
        sector: '',
        dates: {
          startDate: this.$moment(selectedDay).hours(8).toISOString(),
          endDate: this.$moment(selectedDay).hours(10).toISOString(),
        },
      };

      this.selectedAuxiliary.hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(this.selectedAuxiliary, selectedDay);
      this.selectedAuxiliary.hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(this.selectedAuxiliary, selectedDay);

      this.creationModal = true;
    },
  },
}
</script>

<style lang="stylus" scoped>
.planning-header
  /deep/ .q-field__control
    background-color: $grey-3 !important
</style>
