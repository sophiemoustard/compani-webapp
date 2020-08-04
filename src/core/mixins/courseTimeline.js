import { FORTHCOMING, IN_PROGRESS, COMPLETED } from '@data/constants';

export const courseTimelineMixin = {
  computed: {
    courseListForthcoming () {
      return this.courses
        .filter(this.isForthcoming)
        .map((course) => {
          course.status = FORTHCOMING;
          return course;
        })
        .sort((a, b) => {
          if (a.slotsToPlan.length && !b.slotsToPlan.length) return -1;
          if (!a.slotsToPlan.length && b.slotsToPlan.length) return 1;
          return this.getRangeNowToStartCourse(a) - this.getRangeNowToStartCourse(b)
        });
    },
    courseListInProgress () {
      return this.courses
        .filter(this.isInProgress)
        .map((course) => {
          course.status = IN_PROGRESS;
          return course;
        })
        .sort((a, b) => {
          if (a.slotsToPlan.length && !b.slotsToPlan.length) return -1;
          if (!a.slotsToPlan.length && b.slotsToPlan.length) return 1;
          return this.getRangeNowToNextSlot(a) - this.getRangeNowToNextSlot(b)
        });
    },
    courseListCompleted () {
      return this.courses
        .filter(this.isCompleted)
        .map((course) => {
          course.status = COMPLETED;
          return course;
        })
        .sort((a, b) => this.getRangeNowToEndCourse(a) - this.getRangeNowToEndCourse(b));
    },
  },
  methods: {
    isForthcoming (course) {
      const noSlot = !course.slots.length;
      const noSlotHappened = !course.slots.some(this.happened);

      return noSlot || noSlotHappened;
    },
    isInProgress (course) {
      const notEverySlotsHappened = course.slots.some((sameDaySlots) => !this.happened(sameDaySlots));
      const slotsToPlan = course.slotsToPlan.length;

      return !this.isForthcoming(course) && (notEverySlotsHappened || slotsToPlan);
    },
    isCompleted (course) {
      return !this.isForthcoming(course) && !this.isInProgress(course);
    },
    getRangeNowToStartCourse (course) {
      if (!course.slots.length && course.slotsToPlan.length) return 0;
      if (!course.slots.length) return Number.MAX_SAFE_INTEGER;

      const firstSlot = course.slots[0];
      return this.$moment(firstSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToNextSlot (course) {
      const nextSlot = course.slots.filter((daySlots) => !this.happened(daySlots))[0];
      if (!nextSlot) return 0;

      return this.$moment(nextSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToEndCourse (course) {
      const lastSlot = course.slots[course.slots.length - 1];
      return this.$moment().diff(this.$moment(lastSlot[0].startDate), 'd', true);
    },
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
  },
}
