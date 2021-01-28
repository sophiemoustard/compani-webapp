<template>
  <div class="person-inner-cell">
    <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatIdentity('fL') }}</div>
    <div :class="[!staffingView && 'q-mb-sm']">
      <div class="chip-container">
        <q-chip small text-color="white">
          <span class="chip-indicator">{{ indicators.weeklyHours }}h - {{ indicators.auxiliariesNumber }}</span>
          <q-icon size="14px" name="mdi-human-male" />
        </q-chip>
      </div>
    </div>
    <div class="referent-name overflow-hidden-nowrap">{{ getReferent(person) | formatIdentity('Fl') }}</div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';
import moment from '@helpers/moment';

export default {
  name: 'ChipCustomerIndicator',
  props: {
    events: { type: Array, default: () => [] },
    person: { type: Object, default: () => ({}) },
    staffingView: { type: Boolean, default: false },
    startOfWeek: { type: String, default: '' },
  },
  computed: {
    indicators () {
      const auxiliaries = [];
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.auxiliary && !auxiliaries.includes(event.auxiliary._id)) auxiliaries.push(event.auxiliary._id);
        weeklyHours += moment(event.endDate).diff(event.startDate, 'h', true);
      });
      return { auxiliariesNumber: auxiliaries.length, weeklyHours: Math.round(weeklyHours) };
    },
  },
  methods: {
    getReferent (person) {
      const referentHistory = person.referentHistories
        .filter(rh => moment(this.startOfWeek).isSameOrAfter(rh.startDate) &&
          (!rh.endDate || moment(this.startOfWeek).isBefore(rh.endDate)))
        .sort((a, b) => a.startDate - b.startDate);

      return get(referentHistory[0], 'auxiliary.identity', {});
    },
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
  },
  filters: {
    formatIdentity,
  },
};
</script>

<style lang="stylus" scoped>
  .referent-name
    font-style: italic;
    @media (min-width: $breakpoint-md-min)
      margin-top: 15px;
      font-size: 12px;
    @media (min-width: 421px) and (max-width: $breakpoint-sm-max)
      margin-top: 15px;
      font-size: 8px;
    @media (max-width: 420px)
      font-size: 8px;
      margin-top: 0px;

  .person
    &-name
      font-weight: 600;
      font-size: 14px;
      @media (min-width: $breakpoint-md-min)
        margin-bottom: 15px;
      @media (min-width: 421px) and (max-width: $breakpoint-sm-max)
        margin-bottom: 15px;
        font-size: 12px;
      @media (max-width: 420px)
        font-size: 8px;
        margin-bottom: 0px;
    &-inner-cell
      margin-top: 4px;
</style>
