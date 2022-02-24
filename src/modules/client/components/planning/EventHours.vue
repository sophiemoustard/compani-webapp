<template>
  <div :class="['icon-container', $q.screen.width < 767 ? 'flex-column' : 'flex-row']">
    <div class="hour-content">
      <div class="q-pr-xs" data-cy="event-start-hour">{{ startHour }}</div>
      <q-icon v-if="event.startDateTimeStamp" class="bold" name="check" />
    </div>
    <div v-if="!($q.screen.width < 767)" class="q-pr-xs q-pl-xs"> - </div>
    <div class="hour-content">
      <div class="q-pr-xs" data-cy="event-end-hour">{{ endHour }}</div>
      <q-icon v-if="event.endDateTimeStamp" class="bold" name="check" />
    </div>
  </div>
</template>

<script>

export default {
  name: 'EventHours',
  props: {
    startHour: { type: String, default: '' },
    endHour: { type: String, default: '' },
    event: { type: Object, default: () => ({}) },
  },
};
</script>

<style lang="sass" scoped>
.icon-container
  display: flex
  justify-content: left
  font-size: 10px
.hour-content
  display: flex
  flex-direction: row
  color: $copper-700
.bold
  font-weight: bold
</style>
