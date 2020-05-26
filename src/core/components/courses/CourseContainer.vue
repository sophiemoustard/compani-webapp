<template>
  <div class="course-container">
    <div class="text-weight-bold q-mb-sm">{{ title }}</div>
    <course-card class="q-mb-sm" v-for="(course, index) in courses" :key="index" :course="course"
      @click="goToCourseProfile" />
  </div>
</template>

<script>
import { TRAINER } from '@data/constants';
import CourseCard from '@components/courses/CourseCard';

export default {
  name: 'CourseContainer',
  props: {
    title: { type: String, default: '' },
    courses: { type: Array, default: () => [] },
  },
  components: {
    'course-card': CourseCard,
  },
  computed: {
    vendorRole () {
      return this.$store.getters['main/vendorRole'];
    },
  },
  methods: {
    goToCourseProfile (course) {
      let route = {};
      if (/\/ad\//.test(this.$router.currentRoute.path)) {
        route = {
          name: this.vendorRole === TRAINER ? 'trainers courses info' : 'ni management courses info',
          params: { courseId: course._id },
        }
      } else {
        route = {
          name: 'ni courses info',
          params: { courseId: course._id },
        };
      }
      this.$router.push(route);
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
