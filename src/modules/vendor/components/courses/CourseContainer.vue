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
