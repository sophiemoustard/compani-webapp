<template>
  <div>
    <div class="economic-indicators">
      <div class="progress-indicator">
        <div class="progress-caption">
          <div>Heures à travailler</div>
          <div>{{ details.hoursToWork | formatHours }}</div>
        </div>
      </div>
      <div class="progress-indicator">
        <div class="progress-caption">
          <div>Heures travaillées</div>
          <div>{{ details.workedHours | formatHours }}</div>
        </div>
      </div>
      <div class="progress-indicator">
        <div class="progress-caption">
          <div>Soldes d'heures du mois</div>
          <div>{{ details.hoursBalance | formatHours }}</div>
        </div>
      </div>
    </div>
    <div class="quality-indicators">
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
