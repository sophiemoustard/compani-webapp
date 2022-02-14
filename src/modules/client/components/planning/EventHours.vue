<template>
  <div class="icon-container">
    <p class="q-mr-xs q-mb-none" data-cy="event-start-hour">{{ getEventStartHour(event) }}</p>
    <q-icon v-if="event.startDateTimeStamp" class="bold" name="check" />
    <p class="q-pr-xs q-pl-xs"> - </p>
    <p class="q-mr-xs q-mb-none" data-cy="event-end-hour">{{ getEventEndHour(event) }}</p>
    <q-icon v-if="event.endDateTimeStamp" class="bold" name="check" />
  </div>
</template>

<script>

import { planningEventMixin } from 'src/modules/client/mixins/planningEventMixin';

export default {
  name: 'EventHours',
  mixins: [planningEventMixin],
  props: {
    event: { type: Object, default: () => ({}) },
  },
};
</script>

<style lang="sass" scoped>
.icon-container
  display: flex
  flex-direction: row
  justify-content: left
  color: $copper-500
  font-size: 10px
.bold
  font-weight: bold

</style>
