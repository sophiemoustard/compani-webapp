import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
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
      backgroundClass: isClientInterface ? 'client-background' : 'vendor-background',
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
    async deleteCourse () {
      try {
        await Courses.delete(this.course._id);
        NotifyPositive('Formation supprimée.');
        this.$router.push({ name: 'ni management blended courses' });
      } catch (e) {
        console.error(e);
        if (e.status === 403) NotifyNegative('Vous ne pouvez pas supprimer cette formation.');
        if (e.msg) NotifyNegative('Erreur lors de la suppression de la formation.');
      }
    },
    validateCourseDeletion () {
      if (this.disableCourseDeletion) return;
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Confirmez-vous la suppression ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCourse)
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
  },
  beforeDestroy () {
    this.$store.dispatch('course/resetCourse');
    if (!['ni courses', 'ni management blended courses', 'trainers courses'].includes(this.$router.currentRoute.name)) {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
