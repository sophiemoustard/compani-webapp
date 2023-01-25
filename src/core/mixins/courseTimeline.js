import { FORTHCOMING, IN_PROGRESS, COMPLETED } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';
import { durationAscendingSort } from '@helpers/dates/utils';

export const courseTimelineMixin = {
  computed: {
    courseListForthcoming () {
      return this.courses
        .filter(this.isForthcoming)
        .map(course => ({ ...course, status: FORTHCOMING }))
        .sort(
          (a, b) => durationAscendingSort(this.getDurationNowToStartCourse(a), this.getDurationNowToStartCourse(b))
        );
    },
    courseListInProgress () {
      return this.courses
        .filter(this.isInProgress)
        .map(course => ({ ...course, status: IN_PROGRESS }))
        .sort((a, b) => {
          if (a.slotsToPlan.length && !b.slotsToPlan.length) return -1;
          if (!a.slotsToPlan.length && b.slotsToPlan.length) return 1;

          return durationAscendingSort(this.getDurationNowToNextSlot(a), this.getDurationNowToNextSlot(b));
        });
    },
    courseListCompleted () {
      return this.courses
        .filter(this.isCompleted)
        .map(course => ({ ...course, status: COMPLETED }))
        .sort((a, b) => durationAscendingSort(this.getDurationNowToEndCourse(a), this.getDurationNowToEndCourse(b)));
    },
  },
  methods: {
    isForthcoming (course) {
      const noSlot = !course.slots.length;
      const noSlotHappened = !course.slots.some(this.happened);

      return noSlot || noSlotHappened;
    },
    isInProgress (course) {
      const notEverySlotsHappened = course.slots.some(sameDaySlots => !this.happened(sameDaySlots));
      const slotsToPlan = course.slotsToPlan.length;

      return !this.isForthcoming(course) && (notEverySlotsHappened || slotsToPlan);
    },
    isCompleted (course) {
      return !this.isForthcoming(course) && !this.isInProgress(course);
    },
    getDurationNowToStartCourse (course) {
      if (!course.slots.length && course.estimatedStartDate) {
        return CompaniDate(course.estimatedStartDate).diff(CompaniDate(), 'day');
      }
      if (!course.slots.length && course.slotsToPlan.length) return `PT${Number.MAX_SAFE_INTEGER - 1}S`;
      if (!course.slots.length) return `PT${Number.MAX_SAFE_INTEGER}S`;

      const firstSlot = course.slots[0];
      return CompaniDate(firstSlot[0].startDate).diff(CompaniDate(), 'day');
    },
    getDurationNowToNextSlot (course) {
      const nextSlot = course.slots.filter(daySlots => !this.happened(daySlots))[0];
      if (!nextSlot) return 'PT0S';

      return CompaniDate(nextSlot[0].startDate).diff(CompaniDate(), 'day');
    },
    getDurationNowToEndCourse (course) {
      const lastSlot = course.slots[course.slots.length - 1];
      return CompaniDate().diff(CompaniDate(lastSlot[0].startDate), 'day');
    },
    happened (sameDaySlots) {
      return CompaniDate().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
  },
};
