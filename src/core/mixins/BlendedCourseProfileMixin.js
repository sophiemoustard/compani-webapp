import { mapState } from 'vuex';
import { INTER_B2B } from '@data/constants';

export const blendedCourseProfileMixin = {
  data () {
    return {
      courseName: '',
    };
  },
  computed: {
    ...mapState('course', ['course']),
    isCourseInter () {
      return this.course.type === INTER_B2B;
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];
    },
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
