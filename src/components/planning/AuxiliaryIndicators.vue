<template>
  <div>
    <div class="economic-indicators">
      <p style="font-weight:bold">
        {{ totalWorkingHours | formatHours }} travaillées
      </p>
      <div class="progress-indicator">
        <q-linear-progress :value="Math.round(weeklyInterventionsPercentage) / 100" class="intervention" />
        <div class="progress-caption">
          <div>Interventions</div>
          <div>{{ weeklyInterventions | formatHours }}</div>
        </div>
      </div>
      <div class="progress-indicator">
        <q-linear-progress :value="Math.round(weeklyInternalHoursPercentage) / 100" class="internal-hours" />
        <div class="progress-caption">
          <div>Heures internes</div>
          <div>{{ weeklyInternalHours | formatHours }}</div>
        </div>
      </div>
      <div class="progress-indicator">
        <q-linear-progress :value="Math.round(weeklyPaidTransportsPercentage) / 100" class="transports" />
        <div class="progress-caption">
          <div>Transports</div>
          <div>{{ weeklyPaidTransports | formatHours }}</div>
        </div>
      </div>
    </div>
    <div class="quality-indicators">
      <div class="quality-indicators-item">
        <span class="highlight">{{ customersCount }}</span> bénéficiaires accompagnés,
        <span class="highlight">{{ `${Math.round(averageTimeByCustomer)}h` }}</span>
        par {{ averageHoursLabels[timeUnit] }} en moyenne
      </div>
      <div class="quality-indicators-item">
        <span class="highlight">{{ `${Math.round(weeklyBreak)}h` }}</span> de coupure, incluant transport
      </div>
    </div>
  </div>
</template>

<script>
import { WEEK_STATS, MONTH_STATS } from '../../data/constants';
import { formatHours } from '../../helpers/utils';

export default {
  name: 'AuxiliaryIndicators',
  data () {
    return {
      averageHoursLabels: { [WEEK_STATS]: 'semaine', [MONTH_STATS]: 'mois' },
    };
  },
  props: {
    totalWorkingHours: { type: Number, default: 0 },
    weeklyInterventions: { type: Number, default: 0 },
    weeklyInternalHours: { type: Number, default: 0 },
    weeklyPaidTransports: { type: Number, default: 0 },
    customersCount: { type: Number, default: 0 },
    averageTimeByCustomer: { type: Number, default: 0 },
    weeklyBreak: { type: Number, default: 0 },
    timeUnit: { type: String, default: WEEK_STATS },
  },
  computed: {
    weeklyInternalHoursPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInternalHours / this.totalWorkingHours * 100;
    },
    weeklyInterventionsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyInterventions / this.totalWorkingHours * 100;
    },
    weeklyPaidTransportsPercentage () {
      if (this.totalWorkingHours === 0) return 0;
      return this.weeklyPaidTransports / this.totalWorkingHours * 100;
    },
  },
  filters: {
    formatHours: hours => formatHours(hours, 1),
  },
}
</script>

<style lang="stylus" scoped>
  .progress-indicator
    padding: 3px
    border-top: 1px solid $light-grey;
    border-left: 1px solid $light-grey;
    border-right: 1px solid $light-grey;
    &:last-child
      border-bottom: 1px solid $light-grey;

  .progress-caption
    display: flex;
    justify-content: space-between;

  .highlight
    color: $primary
    font-weight: bold

  .economic-indicators
    padding: 0 24px;
    margin: 24px 0;
    border-left: 5px solid $primary-dark !important;

  .quality-indicators
    padding: 0 24px;
    margin-bottom: 24px;
    border-left: 5px solid $primary !important;

  .quality-indicators-item
    border-top: 1px solid $light-grey;
    padding: 10px 0;

  .q-linear-progress
    height: 10px !important;
    /deep/ .q-linear-progress__track
      background: repeating-linear-gradient(45deg, $grey-3, $grey-3 1px, $white 1px, $white 3px)
      opacity: 0.8;
    &.intervention
      /deep/ .q-linear-progress__model
        color: $light-pink;
    &.internal-hours
      /deep/ .q-linear-progress__model
        color: $light-purple;
    &.transports
      /deep/ .q-linear-progress__model
        color: $primary-dark;

</style>
