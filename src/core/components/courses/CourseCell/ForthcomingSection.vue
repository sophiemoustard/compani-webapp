<template>
  <div class="additional-infos-container">
    <q-item class="infos-course-container">
      <q-item-section :class="['additional-infos', { 'to-plan' : course.slotsToPlan.length }]">
        <q-icon size="12px" name="mdi-calendar-range" />
        <q-item-label>{{ formatCourseSlotsInfos }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-item class="infos-course-container">
      <q-item-section class="additional-infos">
        <q-icon size="12px" name="mdi-account-multiple" />
        <q-item-label>({{ traineesCount }})</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import get from 'lodash/get';
import { computed, toRefs } from 'vue';
import { SHORT_DURATION_H_MM } from '@data/constants';
import { formatQuantity } from '@helpers/utils';
import CompaniDuration from '@helpers/dates/companiDurations';
import { getISOTotalDuration } from '@helpers/dates/utils';

export default {
  name: 'ForthcomingSection',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  emits: ['click'],
  setup (props) {
    const { course } = toRefs(props);

    const traineesCount = computed(() => get(course.value, 'trainees.length') || 0);

    const slotsDurationTitle = computed(() => {
      if (!course.value || !course.value.slots) return '0h';

      const slotsDuration = getISOTotalDuration(course.value.slots.flat());

      return CompaniDuration(slotsDuration).format(SHORT_DURATION_H_MM);
    });

    const formatCourseSlotsInfos = computed(() => {
      const slotsToPlanLength = course.value.slotsToPlan.length;
      const totalDates = course.value.slots.length + slotsToPlanLength;

      return !totalDates
        ? '0 date'
        : `${formatQuantity('date', totalDates)},
          ${slotsToPlanLength ? `dont ${slotsToPlanLength} à planifier, ` : ''}${slotsDurationTitle.value}`;
    });

    return {
      // Computed
      traineesCount,
      formatCourseSlotsInfos,
      // Methods
    };
  },
};
</script>

<style lang="sass" scoped>
.infos-course-container
  align-items: center
  margin-top: 10px
  & > .q-item__section
    display: flex
    justify-content: flex-start
    flex-direction: row
    &.q-item__section--side
      margin-right: 10px
    & > .q-icon
      margin-right: 5px

.additional-infos-container
  display: flex
  justify-content: flex-end
  flex-wrap: wrap
</style>
