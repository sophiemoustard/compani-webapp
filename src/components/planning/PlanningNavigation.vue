<template>
  <div class="items-center row justify-around">
    <div class="planning-month col-6">
      <div class="cursor-pointer" @click.native="datimeModal = !datimeModal">
        <span class="text-capitalize">{{ timelineTitle }}</span>
        <q-icon name="arrow_drop_down" />
        <q-menu v-model="datimeModal" self="top middle" anchor="bottom middle">
          <q-date minimal @input="goToWeek" :value="date" />
        </q-menu>
      </div>
    <div class="week-number">Semaine {{ weekNumber }}</div>
    </div>
    <div class="planning-navigation-actions col-6">
      <div>
        <q-btn icon="chevron_left" dense flat round @click="goToPreviousWeek()" />
        <q-btn icon="chevron_right" dense flat round @click="goToNextWeek()" />
        <q-btn icon="today" dense flat round @click="goToToday" />
      </div>
      <template v-if="$q.platform.is.mobile && isAgenda">
        <q-btn class="planning-view" sizs="sm" flat v-if="!isThreeDaysView" label="3J"
          @click="updateViewMode(THREE_DAYS_VIEW)" />
        <q-btn class="planning-view" sizs="sm" flat v-else label="7J" @click="updateViewMode(WEEK_VIEW)" />
      </template>
      <q-btn v-if="isCoachOrPlanningReferent" icon="highlight_off" flat round dense @click="openDeleteEventsModal" />
      <q-btn v-if="!isAgenda && !isCustomerPlanning" icon="playlist_play" flat round dense
        @click="toggleHistory" :color="displayHistory ? 'primary' : ''" />
    </div>
  </div>
</template>

<script>
import { AGENDA, PLANNING, THREE_DAYS_VIEW, WEEK_VIEW } from '../../data/constants';

export default {
  name: 'PlanningNavigation',
  props: {
    timelineTitle: { type: String, default: '' },
    targetDate: { type: String },
    viewMode: { type: String, default: 'week' },
    type: { type: String, default: PLANNING },
    isCoachOrPlanningReferent: { type: Boolean, default: false },
    isCustomerPlanning: { type: Boolean, default: false },
    displayHistory: { type: Boolean, default: false },
  },
  data () {
    return {
      datimeModal: false,
      THREE_DAYS_VIEW,
      WEEK_VIEW,
    };
  },
  computed: {
    isAgenda () {
      return this.type === AGENDA;
    },
    isThreeDaysView () {
      return this.viewMode === THREE_DAYS_VIEW;
    },
    date () {
      return this.$moment(this.targetDate).format('YYYY/MM/DD');
    },
    weekNumber () {
      return this.$moment(this.targetDate).week();
    },
  },
  methods: {
    goToNextWeek (value) {
      this.$emit('goToNextWeek', value)
    },
    goToPreviousWeek (value) {
      this.$emit('goToPreviousWeek', value)
    },
    goToWeek (value) {
      const momentValue = this.$moment(value, 'YYYY/MM/DD', true)
      if (!momentValue.isValid()) return;
      this.$emit('goToWeek', momentValue.toISOString())
    },
    goToToday (value) {
      this.$emit('goToToday', value)
    },
    updateViewMode (value) {
      this.$emit('updateViewMode', value);
    },
    openDeleteEventsModal (value) {
      this.$emit('openDeleteEventsModal', value);
    },
    toggleHistory (value) {
      this.$emit('toggleHistory', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .planning-history-button
    display: flex;
    align-items: center;

  .planning-month
    align-items: center

  .week-number
    font-size: 12px
    font-style: italic
</style>
