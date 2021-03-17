import { mapState } from 'vuex';

export const blendedCourseProfileMixin = {
  data () {
    return {
      courseName: '',
    };
  },
  computed: {
    ...mapState('course', ['course']),
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
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
  beforeDestroy () {
    this.$store.dispatch('course/resetCourse');
    if (!['ni courses', 'ni management blended courses', 'trainers courses'].includes(this.$router.currentRoute.name)) {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
