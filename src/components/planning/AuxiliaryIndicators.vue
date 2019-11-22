<template>
  <div>
    <div class="economic-indicators">
      <div class="indicator row">
        <div class="col-4">Heures à travailler</div>
        <div class="col-2 indicator-hours">{{ hoursToWork | formatHours }}</div>
        <div class="col-6">{{ details.contractHours | formatHours }} (contrat) - {{ absencesHours | formatHours }} (absence)</div>
      </div>
      <div class="indicator row">
        <div class="col-4">Heures travaillées</div>
        <div class="col-2 indicator-hours">{{ workedHours | formatHours }}</div>
        <div class="col-6">{{ workedHoursDetail }}</div>
      </div>
      <div class="indicator row text-weight-bold">
        <div class="col-4">Soldes d'heures du mois</div>
        <div class="col-2 indicator-hours">{{ hoursBalance | formatHours }}</div>
      </div>
    </div>
    <div class="quality-indicators">
      <div class="quality-indicators-item">
        <span class="highlight">{{ details.customersCount }}</span> bénéficiaires accompagnés,
        <span class="highlight">{{ `${Math.round(averageTimeByCustomer)}h` }} en moyenne</span>
      </div>
      <div class="quality-indicators-item">
        <span class="highlight">{{ details.paidTransportHours | formatHours }}</span> de transport rémunéré
      </div>
    </div>
  </div>
</template>

<script>
import { formatHours } from '../../helpers/utils';

export default {
  name: 'AuxiliaryIndicators',
  props: {
    details: { type: Object, default: () => ({}) },
  },
  filters: {
    formatHours: hours => formatHours(hours, 1),
  },
  computed: {
    averageTimeByCustomer () {
      if (!this.details.customersCount) return 0;
      return this.workedHours / this.details.customersCount;
    },
    hoursToWork () {
      return this.details.diff && this.details.diff.absencesHours
        ? this.details.diff.absencesHours + this.details.hoursToWork
        : this.details.hoursToWork;
    },
    absencesHours () {
      return this.getHoursWithDiff('absencesHours');
    },
    hoursBalance () {
      return this.getHoursWithDiff('hoursBalance');
    },
    workedHours () {
      return this.getHoursWithDiff('workedHours');
    },
    workedHoursDetail () {
      let detail = '';
      if (this.details.internalHours) detail += ` ${formatHours(this.details.internalHours, 1)} internes`;
      if (this.details.diff && this.details.diff.workedHours) {
        if (detail !== '') detail += ' et'
        detail += ` ${formatHours(this.details.diff.workedHours, 1)} de rattrapage`;
      }

      return detail;
    },
  },
  methods: {
    getHoursWithDiff (key) {
      return this.details.diff && this.details.diff[key]
        ? this.details.diff[key] + this.details[key]
        : this.details[key];
    },
  },
}
</script>

<style lang="stylus" scoped>
  .indicator
    display: flex;
    border-top: 1px solid $light-grey
    border-left: 1px solid $light-grey
    border-right: 1px solid $light-grey
    div
      padding: 3px 4px
    &:last-child
      border-bottom: 1px solid $light-grey

  .indicator-hours
    display: flex
    border-left:  1px solid $light-grey

  .highlight
    color: $primary
    font-weight: bold

  .economic-indicators
    padding: 0 24px
    margin: 24px 0
    border-left: 5px solid $primary-dark !important

  .quality-indicators
    padding: 0 24px
    margin-bottom: 24px
    border-left: 5px solid $primary !important

  .quality-indicators-item
    border-top: 1px solid $light-grey
    padding: 10px 0
</style>
