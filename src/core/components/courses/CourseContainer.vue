<template>
  <div :class="`course-container ${backgroundClass}`">
    <div class="text-weight-bold q-mb-sm">{{ title }} ({{ courses.length }})</div>
    <course-cell class="q-mb-sm" v-for="(course, index) in courses" :key="index" :course="course"
      @click="goToBlendedCourseProfile" />
  </div>
</template>

<script>
import { TRAINER, CLIENT, VENDOR } from '@data/constants';
import CourseCell from '@components/courses/CourseCell';

export default {
  name: 'CourseContainer',
  props: {
    title: { type: String, default: '' },
    courses: { type: Array, default: () => [] },
  },
  components: {
    'course-cell': CourseCell,
  },
  data () {
    const interfaceType = /\/ad\//.test(this.$route.path) ? VENDOR : CLIENT;

    return {
      interfaceType,
      backgroundClass: interfaceType === CLIENT ? 'bg-copper-grey-200' : 'bg-peach-200',
    };
  },
  computed: {
    vendorRole () {
      return this.$store.getters['main/getVendorRole'];
    },
  },
  methods: {
    goToBlendedCourseProfile (course) {
      let name = '';
      if (this.interfaceType === VENDOR) {
        name = this.vendorRole === TRAINER ? 'trainers courses info' : 'ni management blended courses info';
      } else {
        name = 'ni courses info';
      }
      this.$router.push({ name, params: { courseId: course._id } });
    },
  },
};
</script>

<style lang="sass" scoped>
.course-container
  padding: 10px
  border-radius: 3px
  &:not(:first-child)
    margin-left: 10px
  &:not(:last-child)
    margin-right: 10px
  @media screen and (min-width: 768px)
    width: 33%
  @media screen and (max-width: 767px)
    min-width: 250px
</style>
