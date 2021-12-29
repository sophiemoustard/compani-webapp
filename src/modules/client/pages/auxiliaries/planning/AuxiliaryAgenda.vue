<template>
  <q-page class="client-background" :style="{ height: height }">
    <div :class="[{ 'planning': !drawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-sm-5 person-name">
          <template v-if="Object.keys(selectedAuxiliary).length > 0">
            <img :src="getAvatar(selectedAuxiliary)" class="avatar">
            <ni-select :model-value="selectedAuxiliary._id" :options="auxiliariesOptions" no-error
              ref="personSelect" behavior="menu" icon="swap_vert" class="person-name-select" data-cy="agenda-search"
              @update:model-value="updateAuxiliary" />
          </template>
        </div>
        <div class="col-xs-12 col-sm-7">
          <planning-navigation :timeline-title="timelineTitle()" :target-date="targetDate" :view-mode="viewMode"
            :type="AGENDA" @go-to-next-week="goToNextWeek" @go-to-previous-week="goToPreviousWeek"
            @go-to-today="goToToday" @go-to-week="goToWeek" @update-view-mode="updateViewMode" />
        </div>
      </div>
      <agenda :events="filteredEvents" :days="days" :person-key="personKey" @open-creation-modal="openCreationModal"
        @open-info-modal="openEditionModal" />
    </div>

    <!-- Event creation modal -->
    <ni-event-creation-modal :validations="eventValidation.newEvent" :loading="loading" :new-event="newEvent"
      :person-key="personKey" :creation-modal="creationModal" :internal-hours="internalHours"
      :active-auxiliaries="activeAuxiliaries" :customers="customers" @reset="resetCreationForm"
      @delete-document="validateDocumentDeletion" @document-uploaded="documentUploaded"
      @submit="validateCreationEvent" @close="closeCreationModal" @update-event="setEvent" />

    <!-- Event edition modal -->
    <ni-event-edition-modal :validations="eventValidation.editedEvent" :loading="loading" :edited-event="editedEvent"
      :edition-modal="editionModal" :internal-hours="internalHours" :active-auxiliaries="activeAuxiliaries"
      :customers="customers" @hide="resetEditionForm" @delete-document="validateDocumentDeletion"
      @document-uploaded="documentUploaded" @submit="validateEventEdition" @delete-event="validateEventDeletion"
      @delete-event-repetition="validationDeletionEventRepetition" :person-key="personKey" @close="closeEditionModal"
      :event-histories="editedEventHistories" :histories-loading="historiesLoading"
      @refresh-histories="refreshHistories" @update-event="setEvent" />
  </q-page>
</template>

<script>
import { ref } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Users from '@api/Users';
import Customers from '@api/Customers';
import Events from '@api/Events';
import Select from '@components/form/Select';
import { NotifyWarning } from '@components/popup/notify';
import { DEFAULT_AVATAR, INTERVENTION, NEVER, AGENDA, AUXILIARY, UNKNOWN_AVATAR, WEEK_VIEW } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import Agenda from 'src/modules/client/components/planning/Agenda';
import PlanningNavigation from 'src/modules/client/components/planning/PlanningNavigation';
import EventCreationModal from 'src/modules/client/components/planning/EventCreationModal';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';
import { usePlanningAction } from 'src/modules/client/composables/planningAction';
import { planningTimelineMixin } from 'src/modules/client/mixins/planningTimelineMixin';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';

export default {
  name: 'AuxiliaryAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    agenda: Agenda,
    'planning-navigation': PlanningNavigation,
    'ni-event-creation-modal': EventCreationModal,
    'ni-event-edition-modal': EventEditionModal,
    'ni-select': Select,
  },
  setup () {
    const personKey = ref(AUXILIARY);
    const customers = ref([]);
    const { newEvent, editedEvent, eventValidation } = usePlanningAction(personKey, customers);

    return { personKey, newEvent, editedEvent, customers, eventValidation };
  },
  mixins: [planningTimelineMixin, planningActionMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      height: 0,
      selectedAuxiliary: {},
      auxiliaries: [],
      internalHours: [],
      loading: false,
      viewMode: WEEK_VIEW,
      AGENDA,
      creationModal: false,
      editionModal: false,
    };
  },
  computed: {
    placeholder () {
      if (!this.selectedAuxiliary.identity) return '';
      return formatIdentity(this.selectedAuxiliary.identity, 'FL');
    },
    activeAuxiliaries () {
      return this.auxiliaries.filter(aux => this.hasContractOnEvent(aux, this.days[0], this.days[6]));
    },
    auxiliariesOptions () {
      return this.activeAuxiliaries.length === 0
        ? [{ label: this.placeholder, value: this.selectedAuxiliary._id }]
        : this.activeAuxiliaries.map(aux => ({ label: formatIdentity(aux.identity, 'FL'), value: aux._id }));
    },
    filteredEvents () {
      return this.events.filter(ev => !ev.isCancelled);
    },
  },
  async mounted () {
    this.height = window.innerHeight;
    this.startOfWeek = moment().startOf('week').toISOString();
    this.selectedAuxiliary = this.loggedUser;
    this.getTimelineDays();
    await Promise.all([this.getAuxiliaries(), this.getCustomers(), this.refresh(), this.setInternalHours()]);
  },
  methods: {
    setEvent (payload) {
      const { path, value } = payload;
      if (this.creationModal) set(this.newEvent, path, value);
      else if (this.editionModal) set(this.editedEvent, path, value);
    },
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
        };
        this.events = await Events.list(params);
      } catch (e) {
        this.events = [];
      }
    },
    async getAuxiliaries () {
      try {
        const params = {};
        const companyId = get(this.loggedUser, 'company._id', null);
        if (companyId) params.company = companyId;
        this.auxiliaries = await Users.list(params);
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
      const isAllowed = this.canEditEvent({ auxiliaryId: this.selectedAuxiliary._id });
      if (!isAllowed) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');

      const selectedDay = this.days[dayIndex];
      if (!this.canCreateEvent(this.selectedAuxiliary, selectedDay)) {
        return NotifyWarning('Impossible de créer un évènement à cette date à cette auxiliaire.');
      }

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
          startDate: moment(selectedDay).hours(8).toISOString(),
          endDate: moment(selectedDay).hours(10).toISOString(),
        },
        misc: '',
      };

      this.selectedAuxiliary.hasContractOnEvent = this.hasContractOnEvent(this.selectedAuxiliary, selectedDay);

      this.creationModal = true;
    },
  },
};
</script>

<style lang="sass" scoped>
.planning-header
  :deep .q-field__control
    background-color: inherit !important

.person-name
  font-size: 14px
  &-select
    @media screen and (max-width: 767px)
      width: 80%
</style>
