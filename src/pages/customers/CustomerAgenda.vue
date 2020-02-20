<template>
  <q-page class="neutral-background" :style="{ height: height }">
    <div :class="[{ 'planning': !toggleDrawer, 'full-height' : true }]">
      <div class="row items-center planning-header">
        <div class="col-xs-12 col-sm-5 person-name row" v-if="customer && customer.identity">
          <img :src="getAvatar()" class="avatar">
          <input class="q-pl-sm neutral-background identity" :value="formatIdentity(customer.identity, 'FL')" readonly />
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
import Customers from '../../api/Customers';
import Events from '../../api/Events';
import { DEFAULT_AVATAR, AGENDA, CUSTOMER, WEEK_VIEW, THREE_DAYS_VIEW } from '../../data/constants';
import { planningTimelineMixin } from '../../mixins/planningTimelineMixin';
import Agenda from '../../components/planning/Agenda';
import PlanningNavigation from '../../components/planning/PlanningNavigation';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'CustomerAgenda',
  metaInfo: { title: 'Agenda' },
  components: {
    'agenda': Agenda,
    'planning-navigation': PlanningNavigation,
  },
  mixins: [planningTimelineMixin],
  data () {
    return {
      customer: {},
      startOfWeek: '',
      events: [],
      height: 0,
      viewMode: WEEK_VIEW,
      AGENDA,
      personKey: CUSTOMER,
    };
  },
  computed: {
    helper () {
      return this.$store.getters['main/user'];
    },
  },
  async mounted () {
    this.viewMode = this.$q.platform.is.mobile ? THREE_DAYS_VIEW : WEEK_VIEW;
    this.height = window.innerHeight;
    this.startOfWeek = this.$moment().startOf('week').toISOString();
    this.getTimelineDays();
    await this.refreshCustomer();
    await this.getEvents();
  },
  methods: {
    async refreshCustomer () {
      try {
        this.customer = await Customers.getById(this.helper.customers[0]._id);
      } catch (e) {
        console.error(e);
        this.customer = {};
      }
    },
    getAvatar () {
      return DEFAULT_AVATAR;
    },
    // Refresh data
    async updateTimeline () {
      this.getTimelineDays();
      await this.getEvents();
    },
    async getEvents () {
      try {
        const params = {
          startDate: this.startOfWeek,
          endDate: this.endOfWeek,
          customer: this.customer._id,
        }
        this.events = await Events.list(params);
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
