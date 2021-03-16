import { mapState } from 'vuex';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
import { INTER_B2B } from '@data/constants';

export const blendedCourseProfileMixin = {
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      courseName: '',
      isClientInterface,
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
    tabsContent () {
      const tabs = [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin },
      ];
      if (!this.isClientInterface) {
        tabs.push({
          label: 'Suivi des stagiaires',
          name: 'traineeFollowUp',
          default: this.defaultTab === 'traineeFollowUp',
          component: ProfileTraineeFollowUp,
        });
      }

      return tabs;
    },
    disableCourseDeletion () {
      return !!this.course.slots.length || !!this.course.trainees.length || !!this.course.slotsToPlan.length;
    },
  },
  watch: {
    course () {
      this.courseName = this.composeCourseName(this.course, !this.isClientInterface);
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    this.courseName = this.composeCourseName(this.course, !this.isClientInterface);
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
