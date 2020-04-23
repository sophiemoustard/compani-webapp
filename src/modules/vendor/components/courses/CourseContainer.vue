<template>
  <div class="course-container">
    <div class="text-weight-bold q-mb-sm">{{ title }}</div>
    <course-card class="q-mb-sm" v-for="(course, index) in courses" :key="index" :course="course"
      @click="goToCourseProfile" />
  </div>
</template>

<script>
import CourseCard from 'src/modules/vendor/components/courses/CourseCard';

export default {
  name: 'CourseContainer',
  props: {
    title: { type: String, default: '' },
    courses: { type: Array, default: () => [] },
  },
  components: {
    'course-card': CourseCard,
  },
  methods: {
    goToCourseProfile (course) {
      this.$router.push({ name: 'profile course info', params: { courseId: course._id } });
    },
    rangeToNearestDate (course) {
      if (this.courseSlotsCount === 0) return { label: 'Pas de date prévue', icon: 'flight_takeoff' };
      const listDaySlots = Object.values(this.course.slots);

      if (!listDaySlots.some((daySlot) => this.isDone(daySlot))) {
        const firstSlot = listDaySlots[0];
        const rangeToNextDate = this.$moment(firstSlot[0].startDate).diff(this.$moment(0, 'HH'), 'd');
        return {
          label: `Commence dans ${rangeToNextDate} jour(s)`,
          icon: 'flight_takeoff',
        };
      } else if (listDaySlots.every((daySlot) => this.isDone(daySlot))) {
        const lastSlot = listDaySlots[listDaySlots.length - 1];
        const rangeToLastDate = this.$moment(0, 'HH').diff(this.$moment(lastSlot[0].startDate), 'd');
        return {
          label: `Dernière date il y a ${rangeToLastDate} jour(s) `,
          icon: 'flight_land',
        };
      } else {
        const nextSlot = listDaySlots.filter((daySlot) => !this.isDone(daySlot))[0];
        const rangeToNextDate = this.$moment(nextSlot[0].startDate).diff(this.$moment(0, 'HH'), 'd');
        if (rangeToNextDate === 0) {
          return { label: 'Prochaine date aujourd’hui', icon: 'flight_takeoff' };
        }
        return {
          label: `Prochaine date dans ${rangeToNextDate} jour(s)`,
          icon: 'flight_takeoff',
        };
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.course-container
  background-color: $light-grey
  padding: 10px
  border-radius: 2%
  &:not(:first-child)
    margin-left: 10px;
  &:not(:last-child)
    margin-right: 10px;
  @media screen and (min-width: 768px)
    width: 33%
  @media screen and (max-width: 767px)
    min-width: 250px

</style>
