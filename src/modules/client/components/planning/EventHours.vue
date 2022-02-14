<template>
  <div :class="['icon-container', $q.screen.width < 767 ? 'flex-column' : 'flex-row']">
    <div class="hour-content">
      <p class="q-pr-xs q-pb-none" data-cy="event-start-hour">{{ getEventStartHour(event) }}</p>
      <q-icon v-if="event.startDateTimeStamp" class="bold" name="check" />
    </div>
    <p v-if="!($q.screen.width < 767)" class="q-pr-xs q-pl-xs"> - </p>
    <div class="hour-content ">
      <p class="q-pr-xs q-pb-none" data-cy="event-end-hour">{{ getEventEndHour(event) }}</p>
      <q-icon v-if="event.endDateTimeStamp" class="bold" name="check" />
    </div>
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
  justify-content: left
  color: $copper-500
  font-size: 10px

.hour-content
  display: flex
  flex-direction: row
.bold
  font-weight: bold

</style>
