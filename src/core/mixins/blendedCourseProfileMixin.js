import { mapState } from 'vuex';

export const blendedCourseProfileMixin = {
  data () {
    return {
      courseName: '',
    };
  },
  computed: {
    ...mapState('course', ['course']),
  },
  methods: {
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/fetchCourse', { courseId: this.courseId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeUnmount () {
    this.$store.dispatch('course/resetCourse');
    if (!['ni courses', 'ni management blended courses', 'trainers courses'].includes(this.$route.name)) {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
