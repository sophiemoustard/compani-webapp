<template>
  <div class="items-center row justify-around">
    <div class="planning-month col-7">
      <div class="cursor-pointer" @click.native="datimeModal = !datimeModal">
        <span class="text-capitalize">{{ timelineTitle }}</span>
        <q-icon name="arrow_drop_down" />
        <q-menu v-model="datimeModal" self="top middle" anchor="bottom middle">
          <q-date minimal @input="goToWeek" :value="date" />
        </q-menu>
      </div>
    </div>
    <div class="planning-actions col-5">
      <q-btn icon="chevron_left" flat round @click="goToPreviousWeek()"></q-btn>
      <q-btn icon="chevron_right" flat round @click="goToNextWeek()"></q-btn>
      <q-btn icon="today" flat round @click="goToToday"></q-btn>
      <template v-if="$q.platform.is.mobile && isAgenda">
        <q-btn class="planning-view" sizs="sm" flat v-if="!isThreeDaysView" label="3J" @click="updateViewMode(THREE_DAYS_VIEW)" />
        <q-btn class="planning-view" sizs="sm" flat v-else label="7J" @click="updateViewMode(WEEK_VIEW)" />
      </template>
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
  },
}
</script>

<style lang="stylus" scoped>
  .planning-history-button
    display: flex;
    align-items: center;
</style>
