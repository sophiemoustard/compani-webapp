<template>
  <div class="indicators-container">
    <div class="economic-indicators indicators">
      <div class="indicator row">
        <div class="col-4 indicator-title">Heures à travailler</div>
        <div class="col-8 row indicator-hours">
          <div class="col-md-3 col-xs-12">{{ hoursToWork | formatHours }}</div>
          <div class="col-md-9 col-xs-12">{{ contractHoursDetail }}</div>
        </div>
      </div>
      <div class="indicator row">
        <div class="col-4 indicator-title">Heures travaillées</div>
        <div class="col-8 row indicator-hours">
          <div class="col-md-3 col-xs-12">{{ workedHours | formatHours }}</div>
          <div class="col-md-9 col-xs-12">{{ workedHoursDetail }}</div>
        </div>
      </div>
      <div class="indicator row text-weight-bold">
        <div class="col-4 indicator-title">Soldes d'heures</div>
        <div class="col-2 indicator-hours">{{ hoursBalance | formatHours }}</div>
      </div>
      <div v-if="hoursDetails.counterAndDiffRelevant" class="indicator row text-weight-bold">
        <div class="col-4 indicator-title">Compteur d'heures</div>
        <div class="col-2 indicator-hours">{{ hoursDetails.hoursCounter | formatHours }}</div>
      </div>
    </div>
    <div class="quality-indicators indicators">
      <div class="quality-indicators-item">
        <span class="highlight">{{ customersDetails.customerCount || 0 }}</span> bénéficiaires accompagnés,
        <span class="highlight">{{ `${Math.round(averageTimeByCustomer)}h` }} en moyenne</span>
      </div>
      <div class="quality-indicators-item">
        <span class="highlight">{{ hoursDetails.paidTransportHours | formatHours }}</span> de transport rémunéré
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { formatHours } from '@helpers/utils';

export default {
  name: 'AuxiliaryIndicators',
  props: {
    hoursDetails: { type: Object, default: () => ({}) },
    customersDetails: { type: Object, default: () => ({}) },
  },
  filters: {
    formatHours: hours => formatHours(hours),
  },
  computed: {
    averageTimeByCustomer () {
      if (!this.customersDetails.customerCount) return 0;
      return (this.customersDetails.duration) / this.customersDetails.customerCount;
    },
    hoursToWork () {
      return get(this.hoursDetails, 'diff.absencesHours') && this.hoursDetails.counterAndDiffRelevant
        ? this.hoursDetails.hoursToWork - this.hoursDetails.diff.absencesHours
        : this.hoursDetails.hoursToWork;
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
      if (this.hoursDetails.internalHours) detail += ` ${formatHours(this.hoursDetails.internalHours)} internes`;
      if (get(this.hoursDetails, 'diff.workedHours') && this.hoursDetails.counterAndDiffRelevant) {
        if (detail !== '') detail += ' et';
        detail += ` ${formatHours(this.hoursDetails.diff.workedHours)} de rattrapage`;
      }

      return detail !== '' ? `dont ${detail}` : detail;
    },
    contractHoursDetail () {
      if (!this.hoursDetails.holidaysHours && !this.absencesHours) return '';

      let detail = formatHours(this.hoursDetails.contractHours);
      if (this.hoursDetails.holidaysHours) detail += ` - ${formatHours(this.hoursDetails.holidaysHours)} (fériés)`;
      if (this.absencesHours) detail += ` - ${formatHours(this.absencesHours)} (absences)`;

      return detail;
    },
  },
  methods: {
    getHoursWithDiff (key) {
      return this.hoursDetails.diff && this.hoursDetails.diff[key] && this.hoursDetails.counterAndDiffRelevant
        ? this.hoursDetails.diff[key] + this.hoursDetails[key]
        : this.hoursDetails[key];
    },
  },
};
</script>

<style lang="sass" scoped>
.indicators-container
  flex-grow: 1
  display: flex
  flex-direction: column
  justify-content: space-between

.indicator
  display: flex
  border-top: 1px solid $copper-grey-300
  border-left: 1px solid $copper-grey-300
  border-right: 1px solid $copper-grey-300
  .indicator-title
    padding: 5px
  .indicator-hours
    padding: 5px
    border-left:  1px solid $copper-grey-300
  &:last-child
    border-bottom: 1px solid $copper-grey-300

.highlight
  color: $primary
  font-weight: bold

.indicators
  padding: 0 24px
  margin: 0 0 24px
  @media screen and (max-width: $breakpoint-sm-max)
    padding: 0 12px

.economic-indicators
  border-left: 5px solid $primary !important
.quality-indicators
  border-left: 5px solid $copper-300 !important

.quality-indicators-item
  border-top: 1px solid $copper-grey-300
  padding: 10px 0
</style>
