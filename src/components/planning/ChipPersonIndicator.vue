<template>
  <td v-if="isCustomerPlanning" valign="top">
    <div class="person-inner-cell">
      <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatIdentity('fL') }}</div>
      <div :class="[!staffingView && 'q-mb-sm']">
        <ni-chip-customer-indicator :person="person" :events="personEvents" />
      </div>
      <div class="referent-name overflow-hidden-nowrap">{{ getReferent(person) | formatIdentity('fL') }}</div>
    </div>
  </td>
  <td v-else valign="top">
    <div class="person-inner-cell">
      <div :class="[!staffingView && 'q-mb-sm']">
        <ni-chip-auxiliary-indicator :person="person" :events="personEvents" :startOfWeek="startOfWeek"
          :working-stats="workingStats" />
      </div>
      <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatIdentity('Fl') }}</div>
    </div>
  </td>
</template>

<script>
import ChipAuxiliaryIndicator from './ChipAuxiliaryIndicator';
import ChipCustomerIndicator from './ChipCustomerIndicator';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ChipPersonIndicator',
  components: {
    'ni-chip-customer-indicator': ChipCustomerIndicator,
    'ni-chip-auxiliary-indicator': ChipAuxiliaryIndicator,
  },
  props: {
    isCustomerPlanning: { type: Boolean, default: false },
    staffingView: { type: Boolean, default: false },
    person: { type: Object, default: () => ({}) },
    workingStats: { type: Object, default: () => ({ workedHours: 0, hoursToWork: 0 }) },
    personEvents: { type: Array, default: () => [] },
    startOfWeek: { type: String, default: '' },
  },
  methods: {
    getReferent (person) {
      return this.$_.get(person, 'referent.identity', {});
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .referent-name
    font-style: italic;
    @media (min-width: 1025px)
      margin-top: 15px;
      font-size: 12px;
    @media (min-width: 421px) and (max-width: 1024px)
      margin-top: 15px;
      font-size: 8px;
    @media (max-width: 420px)
      font-size: 8px;
      margin-top: 0px;

  .person
    &-name
      font-weight: 600;
      font-size: 14px;
      @media (min-width: 1025px)
        margin-bottom: 15px;
      @media (min-width: 421px) and (max-width: 1024px)
        margin-bottom: 15px;
        font-size: 12px;
      @media (max-width: 420px)
        font-size: 8px;
        margin-bottom: 0px;
    &-inner-cell
      margin-top: 4px;
</style>
