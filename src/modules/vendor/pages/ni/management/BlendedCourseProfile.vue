<template>
  <q-page padding class="vendor-background">
    <template v-if="course">
      <ni-blended-course-profile-header :title="courseName" @delete="validateCourseDeletion" @refresh="refreshCourse"
        :header-info="headerInfo" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </template>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileBilling from '@components/courses/ProfileBilling';
import BlendedCourseProfileHeader from '@components/courses/BlendedCourseProfileHeader';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';
import { courseMixin } from '@mixins/courseMixin';

const metaInfo = { title: 'Fiche formation' };

export default {
  name: 'BlendedCourseProfile',
  mixins: [courseMixin, createMetaMixin(metaInfo)],
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'organization' },
  },
  components: {
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return { courseName: '' };
  },
  computed: {
    ...mapState('course', ['course']),
    tabsContent () {
      const organizationTab = {
        label: 'Organisation',
        name: 'organization',
        default: this.defaultTab === 'organization',
        component: ProfileOrganization,
      };
      const followUpTab = {
        label: 'Suivi des stagiaires',
        name: 'traineeFollowUp',
        default: this.defaultTab === 'traineeFollowUp',
        component: ProfileTraineeFollowUp,
      };
      const billingTab = {
        label: 'Facturation',
        name: 'billing',
        default: this.defaultTab === 'billing',
        component: ProfileBilling,
      };

      const vendorRole = this.$store.getters['main/getVendorRole'];
      const isAdmin = [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole);

      return isAdmin ? [organizationTab, followUpTab, billingTab] : [organizationTab, followUpTab];
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
        if (e.status === 403) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la suppression de la formation.');
      }
    },
    validateCourseDeletion () {
      this.$q.dialog({ title: 'Confirmation', message: 'Confirmez-vous la suppression ?', ok: 'OK', cancel: 'Annuler' })
        .onOk(this.deleteCourse)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
  beforeUnmount () {
    this.$store.dispatch('course/resetCourse');
    if (!['ni management blended courses', 'trainers courses'].includes(this.$route.name)) {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
</script>
