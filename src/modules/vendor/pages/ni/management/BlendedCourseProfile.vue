<template>
  <q-page padding class="vendor-background">
    <template v-if="course">
      <ni-blended-course-profile-header :title="courseName" @delete="validateCourseDeletion" @refresh="refreshCourse"
        :disable-course-deletion="disableCourseDeletion" :header-info="headerInfo" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import BlendedCourseProfileHeader from '@components/courses/BlendedCourseProfileHeader';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
import { courseMixin } from '@mixins/courseMixin';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';

export default {
  name: 'BlendedCourseProfile',
  metadata: { title: 'Fiche formation' },
  mixins: [courseMixin, blendedCourseProfileMixin],
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'organization' },
  },
  components: {
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  computed: {
    ...mapState('course', ['course']),
    disableCourseDeletion () {
      return !!this.course.slots.length || !!this.course.trainees.length || !!this.course.slotsToPlan.length;
    },
    tabsContent () {
      return [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin },
        {
          label: 'Suivi des stagiaires',
          name: 'traineeFollowUp',
          default: this.defaultTab === 'traineeFollowUp',
          component: ProfileTraineeFollowUp,
        },
      ];
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    this.courseName = this.composeCourseName(this.course, true);
  },
  watch: {
    course () {
      this.courseName = this.composeCourseName(this.course, true);
    },
  },
  methods: {
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
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
  // le beforeUnmount de la mixin BlendedCourseProfileMixin n'est pas triggered et je ne comprends pas pourquoi
  beforeUnmount () {
    this.$store.dispatch('course/resetCourse');
    if (!['ni courses', 'ni management blended courses', 'trainers courses'].includes(this.$route.name)) {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
</script>
