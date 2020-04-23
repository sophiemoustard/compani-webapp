<template>
  <div class="course-container">
    <div class="text-weight-bold q-mb-sm">{{ title }}</div>
    <course-card class="q-mb-sm" v-for="(course, index) in courseSorted" :key="index" :course="course"
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
  data () {
    return {
      courseSorted: [],
    };
  },
  watch: {
    courses () {
      this.refreshCourseSorted();
    },
  },
  methods: {
    goToCourseProfile (course) {
      this.$router.push({ name: 'profile course info', params: { courseId: course._id } });
    },
    getRangeToNearestDate (course) {
      if (course.slots.length === 0) return Number.MAX_SAFE_INTEGER;
      const listDaySlots = Object.values(course.slots);

      if (this.title === 'À venir') {
        const firstSlot = listDaySlots[0];
        const rangeToNextDate = this.$moment(firstSlot[0].startDate).diff(this.$moment(), 'd', true);
        return rangeToNextDate;
      } else if (this.title === 'Terminée(s)') {
        const lastSlot = listDaySlots[listDaySlots.length - 1];
        const rangeToLastDate = this.$moment().diff(this.$moment(lastSlot[0].startDate), 'd', true);
        return rangeToLastDate;
      } else if (this.title === 'En cours') {
        const nextSlot = listDaySlots.filter((daySlot) => !this.isDone(daySlot))[0];
        const rangeToNextDate = this.$moment(nextSlot[0].startDate).diff(this.$moment(), 'd', true);
        return rangeToNextDate;
      }
    },
    isDone (daySlot) {
      return this.$moment(daySlot[daySlot.length - 1].endDate).isBefore(this.$moment());
    },
    refreshCourseSorted () {
      this.courseSorted = this.courses.sort((a, b) => this.getRangeToNearestDate(a) - this.getRangeToNearestDate(b));
    },
  },
  mounted () {
    this.refreshCourseSorted();
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
