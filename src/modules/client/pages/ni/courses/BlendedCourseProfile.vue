<template>
  <q-page padding class="client-background">
    <template v-if="course">
      <ni-blended-course-profile-header :title="courseName" :header-info="headerInfo" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </template>
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import BlendedCourseProfileHeader from '@components/courses/BlendedCourseProfileHeader';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
import { courseMixin } from '@mixins/courseMixin';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';

const metaInfo = { title: 'Fiche formation' };

export default {
  name: 'BlendedCourseProfile',
  mixins: [courseMixin, blendedCourseProfileMixin, createMetaMixin(metaInfo)],
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'organization' },
  },
  components: {
    'profile-tabs': ProfileTabs,
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
  },
  data () {
    const organizationTab = {
      label: 'Organisation',
      name: 'organization',
      default: this.defaultTab === 'organization',
      component: ProfileOrganization,
    };
    const adminTab = { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin };
    const traineeFollowUpTab = {
      label: 'Suivi des stagiaires',
      name: 'traineeFollowUp',
      default: this.defaultTab === 'traineeFollowUp',
      component: ProfileTraineeFollowUp,
    };

    return {
      organizationTab,
      adminTab,
      traineeFollowUpTab,
    };
  },
  computed: {
    ...mapState('course', ['course']),
    tabsContent () {
      if (this.isIntraCourse) return [this.organizationTab, this.adminTab, this.traineeFollowUpTab];

      return [this.organizationTab, this.traineeFollowUpTab];
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    this.courseName = this.composeCourseName(this.course);
  },
  watch: {
    course () {
      this.courseName = this.composeCourseName(this.course);
    },
  },
};
</script>
