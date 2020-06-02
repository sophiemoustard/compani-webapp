<template>
  <div :class="`course-container ${backgroundClass}`">
    <div class="text-weight-bold q-mb-sm">{{ title }}</div>
    <course-card class="q-mb-sm" v-for="(course, index) in courses" :key="index" :course="course"
      @click="goToCourseProfile" />
  </div>
</template>

<script>
import { TRAINER, CLIENT, VENDOR } from '@data/constants';
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
  data () {
    const interfaceType = /\/ad\//.test(this.$router.currentRoute.path) ? VENDOR : CLIENT;

    return {
      interfaceType,
      backgroundClass: interfaceType === CLIENT ? 'grey-background' : 'beige-background',
    }
  },
  computed: {
    vendorRole () {
      return this.$store.getters['main/vendorRole'];
    },
  },
  methods: {
    goToCourseProfile (course) {
      let name = '';
      if (this.interfaceType === VENDOR) {
        name = this.vendorRole === TRAINER ? 'trainers courses info' : 'ni management courses info';
      } else {
        name = 'ni courses info';
      }
      this.$router.push({ name, params: { courseId: course._id } });
    },
  },
}
</script>

<style lang="stylus" scoped>
.course-container
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
