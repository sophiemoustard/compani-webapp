<template>
  <q-page class="client-background" :style="{ height: height }">
    <div :class="[{ 'planning': !drawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-sm-5 person-name row" v-if="customer && customer.identity">
          <img :src="DEFAULT_AVATAR" class="avatar">
          <input class="q-pl-sm identity" :value="formatIdentity(customer.identity, 'FL')"
            readonly data-cy="customer-identity">
        </div>
        <div class="col-xs-12 col-sm-7">
          <planning-navigation :timeline-title="timelineTitle()" @go-to-next-week="goToNextWeek"
            :target-date="targetDate" :view-mode="viewMode" :type="AGENDA" @go-to-previous-week="goToPreviousWeek"
            @go-to-today="goToToday" @go-to-week="goToWeek" @update-view-mode="updateViewMode" />
        </div>
      </div>
      <agenda :events="events" :days="days" :person-key="personKey"
        @open-info-modal="openConflictModal($event)" />
    </div>

    <event-conflict-modal v-model="conflictModal" :events="conflictingEvents" @hide="closeConflictModal" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import Customers from '@api/Customers';
import Events from '@api/Events';
import CustomerAbsences from '@api/CustomerAbsences';
import { DEFAULT_AVATAR, AGENDA, CUSTOMER, WEEK_VIEW, THREE_DAYS_VIEW, CUSTOMER_ABSENCE } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import { planningTimelineMixin } from 'src/modules/client/mixins/planningTimelineMixin';
import Agenda from 'src/modules/client/components/planning/Agenda';
import EventConflictModal from 'src/modules/client/components/customers/EventConflictModal';
import PlanningNavigation from 'src/modules/client/components/planning/PlanningNavigation';

export default {
  name: 'CustomerAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    agenda: Agenda,
    'planning-navigation': PlanningNavigation,
    'event-conflict-modal': EventConflictModal,
  },
  mixins: [planningTimelineMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      conflictingEvents: [],
      height: 0,
      viewMode: WEEK_VIEW,
      AGENDA,
      personKey: CUSTOMER,
      DEFAULT_AVATAR,
      conflictModal: false,
    };
  },
  computed: {
    ...mapState({
      helper: state => state.main.loggedUser,
      customer: state => state.customer.customer,
    }),
  },
  async created () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.startOfWeek = moment().startOf('week').toISOString();
    this.getTimelineDays();
    if (!this.customer) await this.refreshCustomer();
    await this.getEvents();
  },
  mounted () {
    this.height = window.innerHeight;
  },
  methods: {
    async refreshCustomer () {
      try {
        const customer = await Customers.getById(this.helper.customers[0]);
        this.$store.dispatch('customer/setCustomer', customer);
      } catch (e) {
        console.error(e);
      }
    },
    // Refresh data
    async updateTimeline () {
      this.getTimelineDays();
      await this.getEvents();
    },
    async getEvents () {
      try {
        const query = { startDate: this.startOfWeek, endDate: this.endOfWeek, customer: this.customer._id };

        const interventions = await Events.list(query);
        const absences = await CustomerAbsences.list(query);

        const customerAbsences = absences.map(abs => ({ ...abs, type: CUSTOMER_ABSENCE }));
        this.events = interventions.concat(customerAbsences);
        this.events.filter(ev => ev.type !== CUSTOMER_ABSENCE)
          .map(event => (event.inConflictEvents = this.getInConflictEvents(event)));
      } catch (e) {
        this.events = [];
      }
    },
    formatIdentity,
    openConflictModal (event) {
      if (event.inConflictEvents.length !== 1) {
        this.conflictingEvents = event.inConflictEvents;
        this.conflictModal = true;
      }
    },
    closeConflictModal () {
      this.conflictModal = false;
      this.conflictingEvents = [];
    },
    getInConflictEvents (event) {
      return this.events.filter(
        ev => moment(event.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          moment(ev.endDate).isBetween(event.startDate, event.endDate, 'minutes', '[]')
      ).map(ev => ({ ...ev, displayedStartDate: ev.startDate, displayedEndDate: ev.endDate }));
    },
  },
};
</script>

<style lang="stylus" scoped>
  .identity
    background-color: inherit
    border: none
    flex-grow: 1
  input:focus
    outline: none

.person-name
  font-size: 14px;
</style>
