<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !drawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-sm-5 person-name row" v-if="customer && customer.identity">
          <img :src="DEFAULT_AVATAR" class="avatar">
          <input sclass="q-pl-sm neutral-background identity" :value="formatIdentity(customer.identity, 'FL')"
            readonly data-cy="customer-identity" />
        </div>
        <div class="col-xs-12 col-sm-7">
          <planning-navigation :timelineTitle="timelineTitle()" @goToNextWeek="goToNextWeek" :targetDate="targetDate"
            :view-mode="viewMode" :type="AGENDA" @goToPreviousWeek="goToPreviousWeek" @goToToday="goToToday"
            @goToWeek="goToWeek" @updateViewMode="updateViewMode" />
        </div>
      </div>
      <agenda :events="events" :days="days" :personKey="personKey" />
    </div>
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Customers from '@api/Customers';
import Events from '@api/Events';
import { formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR, AGENDA, CUSTOMER, WEEK_VIEW, THREE_DAYS_VIEW } from '@data/constants';
import { planningTimelineMixin } from 'src/modules/client/mixins/planningTimelineMixin';
import Agenda from 'src/modules/client/components/planning/Agenda';
import PlanningNavigation from 'src/modules/client/components/planning/PlanningNavigation';

export default {
  name: 'CustomerAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    agenda: Agenda,
    'planning-navigation': PlanningNavigation,
  },
  mixins: [planningTimelineMixin],
  data () {
    return {
      startOfWeek: '',
      events: [],
      height: 0,
      viewMode: WEEK_VIEW,
      AGENDA,
      personKey: CUSTOMER,
      DEFAULT_AVATAR,
    };
  },
  computed: {
    ...mapState({ helper: state => state.main.loggedUser }),
    ...mapGetters({ customer: 'customer/getCustomer' }),
  },
  async created () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.startOfWeek = this.$moment().startOf('week').toISOString();
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
        const customer = await Customers.getById(this.helper.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
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
        this.events = await Events.list({
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          customer: this.customer._id,
        });
      } catch (e) {
        this.events = [];
      }
    },
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .identity
    border: none
    flex-grow: 1
  input:focus
    outline: none
</style>
