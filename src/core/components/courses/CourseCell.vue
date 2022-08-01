<template>
  <q-card flat>
    <q-card-section @click="$emit('click', course)">
      <div class="infos-course-nearest-date text-weight-bold">{{ formatNearestDate }}</div>
      <div class="title-text">{{ courseName }}</div>
      <div class="items-container">
        <q-item v-for="info in headerInfo" :key="info.icon" class="item-section-container">
          <q-item-section side>
            <q-icon size="12px" :name="info.icon" :class="info.iconClass" />
          </q-item-section>
          <q-item-section>{{ info.label }}</q-item-section>
        </q-item>
      </div>
      <div v-if="course.status === FORTHCOMING" class="additional-infos-container">
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
    </q-card-section>
    <q-card-section v-if="course.status === IN_PROGRESS" class="slots-timeline-container">
      <div :class="['additional-infos', { 'to-plan' : course.slotsToPlan.length }]">
        {{ slotsHappened }} / {{ course.slots.length + course.slotsToPlan.length }}
        {{ course.slotsToPlan.length ? ` - ${course.slotsToPlan.length} à planifier` : '' }}
      </div>
      <q-item>
        <q-item-section>
          <div class="row slots-timeline">
            <div v-for="(slot, index) in course.slots" :key="index"
              :class="['col-3', 'slots', { 'slots-happened': happened(slot) }]" />
            <div v-for="(slot, index) in course.slotsToPlan" :key="course.slots.length + index + 1"
              class="col-3 slots slots-to-plan" />
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<script>
import get from 'lodash/get';
import { computed, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { FORTHCOMING, COMPLETED, IN_PROGRESS, INTRA } from '@data/constants';
import { formatQuantity } from '@helpers/utils';
import { formatDuration } from '@helpers/date';
import moment from '@helpers/moment';
import { useCourses } from '@composables/courses';

export default {
  name: 'CourseDetail',
  props: {
    course: { type: Object, default: () => ({}) },
  },
  emits: ['click'],
  setup (props) {
    const $router = useRouter();
    const isVendorInterface = /\/ad\//.test($router.currentRoute.value.path);
    const { course } = toRefs(props);

    const { headerInfo, composeCourseName, happened } = useCourses(null, course, null, null);

    const courseName = computed(() => composeCourseName(course.value, isVendorInterface));

    const traineesCount = computed(() => get(course.value, 'trainees.length') || 0);

    const slotsHappened = computed(() => course.value.slots.filter(slot => happened(slot)).length);

    const slotsDurationTitle = computed(() => {
      if (!course.value || !course.value.slots) return '0h';

      let slotsDuration = moment.duration();
      for (const slotByDay of course.value.slots) {
        slotsDuration = slotByDay.reduce(
          (acc, slot) => acc.add(moment.duration(moment(slot.endDate).diff(slot.startDate))),
          slotsDuration
        );
      }

      return formatDuration(slotsDuration);
    });

    const courseSlotsCount = computed(() => course.value.slots.length);

    const formatCourseSlotsInfos = computed(() => {
      const slotsToPlanLength = course.value.slotsToPlan.length;
      const totalDates = courseSlotsCount.value + slotsToPlanLength;

      return !totalDates
        ? '0 date'
        : `${formatQuantity('date', totalDates)},
          ${slotsToPlanLength ? `dont ${slotsToPlanLength} à planifier, ` : ''}${slotsDurationTitle.value}`;
    });

    const formatNearestDate = computed(() => {
      if (!courseSlotsCount.value && course.estimatedStartDate) {
        const rangeToEstimatedStartDate = moment(course.value.estimatedStartDate).diff(moment().startOf('day'), 'd');
        if (rangeToEstimatedStartDate < 0) {
          return `Début souhaité il y a ${formatQuantity('jour', Math.abs(rangeToEstimatedStartDate))}`;
        }
        if (rangeToEstimatedStartDate) {
          return `Début souhaité dans ${formatQuantity('jour', rangeToEstimatedStartDate)}`;
        }

        return 'Début souhaité aujourd\'hui';
      }
      if (!courseSlotsCount.value && !course.value.slotsToPlan.length) return 'Pas de date prévue';
      if (!courseSlotsCount.value) return 'Prochaine date à planifier';

      if (course.value.status === FORTHCOMING) {
        const firstSlot = course.value.slots[0];
        const rangeToNextDate = moment(firstSlot[0].startDate).diff(moment().startOf('day'), 'd');

        return rangeToNextDate ? `Commence dans ${formatQuantity('jour', rangeToNextDate)}` : 'Commence aujourd’hui';
      }

      if (course.value.status === COMPLETED) {
        const lastSlot = course.value.slots[course.value.slots.length - 1];
        const rangeToLastDate = moment().endOf('day').diff(moment(lastSlot[0].startDate), 'd');

        return rangeToLastDate
          ? `Dernière date il y a ${formatQuantity('jour', rangeToLastDate)}`
          : 'Dernière date aujourd’hui';
      }

      const nextSlot = course.value.slots.filter(daySlots => !happened(daySlots))[0];
      if (!nextSlot) return 'Prochaine date à planifier';
      const rangeToNextDate = moment(nextSlot[0].startDate).diff(moment().startOf('day'), 'd');

      return rangeToNextDate
        ? `Prochaine date dans ${formatQuantity('jour', rangeToNextDate)}`
        : 'Prochaine date aujourd’hui';
    });

    return {
      // Data
      INTRA,
      FORTHCOMING,
      IN_PROGRESS,
      COMPLETED,
      isVendorInterface,
      // Computed
      courseName,
      traineesCount,
      slotsHappened,
      formatCourseSlotsInfos,
      formatNearestDate,
      headerInfo,
      // Methods
      get,
      happened,
    };
  },
};
</script>

<style lang="sass" scoped>
.q-card__section
  height: fit-content
  &:hover
    cursor: pointer
  &--vert
    padding: 10px
.title-text
  font-size: 14px
.items-container
  display: flex
  flex-wrap: wrap
  font-size: 12px
  color: $copper-grey-600
.item-section-container
  display: flex
.q-item__section--side
  padding: 0px
  margin-right: 5px
.q-item
  padding: 0px
  min-height: auto
  margin-right: 10px
.infos-course
  &-nearest-date
    color: $copper-grey-900 !important
    font-size: 14px
  &-container
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
.slots
  height: 10px
  flex: 1
  background-color: $copper-300
  &-happened
    background-color: $primary
  &-to-plan
    background-color: $secondary

.additional-infos
  color: $primary
  font-size: 12px
  align-items: flex-end
  &-container
    display: flex
    justify-content: flex-end
    flex-wrap: wrap

.to-plan
  color: $secondary

.slots-timeline-container
  display: flex
  flex-direction: column
  padding: 0px
  overflow: hidden
  .q-item
    margin-right: 0px
  .slots-timeline
    width: 104%
    margin-left: -2%
  .slots-timeline > :nth-child(1)
    margin-left: 0px
  .slots-timeline > div
    margin-left: 1px
  .additional-infos
    display: flex
    padding-right: 10px
    justify-content: flex-end
</style>
