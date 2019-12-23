<template>
  <div class="chip-container">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip small text-color="white">
      <span class="chip-indicator">{{ indicators.weeklyHours }}h - {{ indicators.auxiliariesNumber }}</span>
      <q-icon size="14px" name="mdi-human-male" />
    </q-chip>
  </div>
</template>

<script>
import { DEFAULT_AVATAR } from '../../data/constants.js';

export default {
  name: 'ChipCustomerIndicator',
  props: {
    events: { type: Array, default: () => [] },
    person: { type: Object, default: () => ({}) },
  },
  computed: {
    indicators () {
      const auxiliaries = [];
      let weeklyHours = 0;
      this.events.forEach((event) => {
        if (event.auxiliary && !auxiliaries.includes(event.auxiliary._id)) auxiliaries.push(event.auxiliary._id);
        weeklyHours += this.$moment(event.endDate).diff(event.startDate, 'h', true);
      });
      return { auxiliariesNumber: auxiliaries.length, weeklyHours: Math.round(weeklyHours) };
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-chip
      .q-icon
        width: 8px;

</style>
