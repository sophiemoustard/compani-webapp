<template>
  <q-page padding class="client-background">
    <template v-if="course">
      <ni-blended-course-profile-header :title="courseName" :header-info="headerInfo" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import BlendedCourseProfileHeader from '@components/courses/BlendedCourseProfileHeader';
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
    'profile-tabs': ProfileTabs,
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
  },
  computed: {
    ...mapState('course', ['course']),
    tabsContent () {
      const tabs = [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
      ];
      if (this.isIntraCourse) {
        tabs.push({ label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin });
      }
      tabs.push({
        label: 'Suivi des stagiaires',
        name: 'traineeFollowUp',
        default: this.defaultTab === 'traineeFollowUp',
        component: ProfileTraineeFollowUp,
      });
      return tabs;
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
