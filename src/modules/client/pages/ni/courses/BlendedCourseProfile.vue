<template>
  <q-page padding class="client-background">
    <template v-if="course">
      <ni-blended-course-profile-header :title="courseName" :header-info="headerInfo" />
      <div v-if="isIntraCourse">
        <ni-profile-organization :profile-id="courseId" />
      </div>
      <div v-else>
        <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
      </div>
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import { courseMixin } from '@mixins/courseMixin';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';
import BlendedCourseProfileHeader from '../../../../../core/components/BlendedCourseProfileHeader';

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
    'ni-profile-organization': ProfileOrganization,
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
  },
  computed: {
    ...mapState('course', ['course']),
    tabsContent () {
      return [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin },
      ];
    },
  },
  watch: {
    course () {
      this.courseName = this.composeCourseName(this.course);
    },
  },
};
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0

/deep/ h4
  margin-right: 32px !important
</style>
