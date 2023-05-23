<template>
  <div class="trello">
    <course-container v-for="col in trello" :title="col.title" :courses="col.courses" :key="col.title" />
  </div>
</template>

<script>
import { computed, ref, toRefs, watch } from 'vue';
import groupBy from 'lodash/groupBy';
import CourseContainer from '@components/courses/CourseContainer';
import { FORTHCOMING, IN_PROGRESS, COMPLETED, DAY, PT0S, SECOND, DD_MM_YYYY } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';
import { durationAscendingSort } from '@helpers/dates/utils';

export default {
  name: 'Trello',
  components: {
    'course-container': CourseContainer,
  },
  props: {
    activeCourses: { type: Array, default: () => [] },
    archivedCourses: { type: Array, default: () => [] },
  },
  setup (props) {
    const { activeCourses, archivedCourses } = toRefs(props);

    const forthcomingCourseSortedList = ref([]);
    const inProgressCourseSortedList = ref([]);
    const unarchivedCompletedCourseList = ref([]);

    const completedCourseSortedList = computed(() => {
      const archivedFormattedCourses = archivedCourses.value.map((course) => {
        const courseWithGroupedSlots = {
          ...course,
          slots: course.slots.length
            ? Object.values(groupBy(course.slots, s => CompaniDate(s.startDate).format(DD_MM_YYYY)))
            : [],
        };

        return {
          ...courseWithGroupedSlots,
          status: COMPLETED,
          ...(courseWithGroupedSlots.slots.length
            ? { durationTodayToEndCourse: getDurationTodayToEndCourse(courseWithGroupedSlots) }
            : { durationTodayToCreation: getDurationTodayToCreation(courseWithGroupedSlots) }),
        };
      });

      return [...unarchivedCompletedCourseList.value, ...archivedFormattedCourses]
        .sort((a, b) => {
          const durationA = a.durationTodayToEndCourse || a.durationTodayToCreation;
          const durationB = b.durationTodayToEndCourse || b.durationTodayToCreation;
          return durationAscendingSort(durationA, durationB);
        });
    });

    const trello = computed(() => [
      { title: 'À venir', courses: forthcomingCourseSortedList.value },
      { title: 'En cours', courses: inProgressCourseSortedList.value },
      { title: 'Terminées', courses: completedCourseSortedList.value },
    ]);

    const happened = sameDaySlots => CompaniDate().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);

    const isForthcoming = (course) => {
      const noSlot = !course.slots.length;
      const noSlotHappened = !course.slots.some(happened);

      return noSlot || noSlotHappened;
    };

    const isInProgress = (course) => {
      const notEverySlotsHappened = course.slots.some(sameDaySlots => !happened(sameDaySlots));
      const slotsToPlan = course.slotsToPlan.length;

      return !isForthcoming(course) && (notEverySlotsHappened || slotsToPlan);
    };

    const getDurationTodayToStartCourse = (course) => {
      if (!course.slots.length && course.estimatedStartDate) {
        return CompaniDate(course.estimatedStartDate).diff(CompaniDate().startOf(DAY), SECOND);
      }
      if (!course.slots.length && course.slotsToPlan.length) return `PT${Number.MAX_SAFE_INTEGER - 1}S`;
      if (!course.slots.length) return `PT${Number.MAX_SAFE_INTEGER}S`;

      const firstSlot = course.slots[0];
      return CompaniDate(firstSlot[0].startDate).diff(CompaniDate().startOf(DAY), SECOND);
    };

    const getDurationTodayToNextSlot = (course) => {
      const nextSlot = course.slots.filter(daySlots => !happened(daySlots))[0];
      if (!nextSlot) return PT0S;

      return CompaniDate(nextSlot[0].startDate).diff(CompaniDate().startOf(DAY), SECOND);
    };

    const getDurationTodayToEndCourse = (course) => {
      const lastSlot = course.slots[course.slots.length - 1];
      return CompaniDate().startOf(DAY).diff(CompaniDate(lastSlot[0].startDate), SECOND);
    };

    const getDurationTodayToCreation = course => CompaniDate().startOf(DAY).diff(CompaniDate(course.createdAt), SECOND);

    const groupCoursesByTemporalState = () => {
      const forthcomingCourseList = [];
      const inProgressCourseList = [];

      activeCourses.value.forEach((course) => {
        if (course.slots.length) {
          const courseWithGroupedSlots = {
            ...course,
            slots: Object.values(groupBy(course.slots, s => CompaniDate(s.startDate).format(DD_MM_YYYY))),
          };
          if (isForthcoming(courseWithGroupedSlots)) {
            forthcomingCourseList.push({
              ...courseWithGroupedSlots,
              status: FORTHCOMING,
              durationTodayToStartCourse: getDurationTodayToStartCourse(courseWithGroupedSlots),
            });
          } else if (isInProgress(courseWithGroupedSlots)) {
            inProgressCourseList.push({
              ...courseWithGroupedSlots,
              status: IN_PROGRESS,
              durationTodayToNextSlot: getDurationTodayToNextSlot(courseWithGroupedSlots),
            });
          } else {
            unarchivedCompletedCourseList.value.push({
              ...courseWithGroupedSlots,
              status: COMPLETED,
              durationTodayToEndCourse: getDurationTodayToEndCourse(courseWithGroupedSlots),
            });
          }
        } else {
          forthcomingCourseList.push({
            ...course,
            status: FORTHCOMING,
            durationTodayToStartCourse: getDurationTodayToStartCourse(course),
          });
        }
      });

      forthcomingCourseSortedList.value = forthcomingCourseList
        .sort(
          (a, b) => durationAscendingSort(a.durationTodayToStartCourse, b.durationTodayToStartCourse)
        );

      inProgressCourseSortedList.value = inProgressCourseList
        .sort((a, b) => {
          if (a.slotsToPlan.length && !b.slotsToPlan.length) return -1;
          if (!a.slotsToPlan.length && b.slotsToPlan.length) return 1;

          return durationAscendingSort(a.durationTodayToNextSlot, b.durationTodayToNextSlot);
        });
    };

    watch(activeCourses, () => {
      groupCoursesByTemporalState();
    });

    return {
      // Computed
      trello,
    };
  },
};
</script>

<style lang="sass" scoped>
.trello
  overflow: auto
  display: flex
  flex-direction: row
  @media screen and (min-width: 768px)
    justify-content: space-between
</style>
