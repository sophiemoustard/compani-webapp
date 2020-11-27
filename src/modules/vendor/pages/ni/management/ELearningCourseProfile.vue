<template>
    <q-page class="vendor-background" padding>
      <ni-profile-header :title="courseName" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </q-page>
</template>

<script>
import get from 'lodash/get';
import Courses from '@api/Courses';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ELearningCourseFollowUp from './ELearningCourseFollowUp';
import ELearningCourseAccess from './ELearningCourseAccess';

export default {
  name: 'ELearningCoursesProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'followUp' },
  },
  data () {
    return {
      courseName: '',
      tabsContent: [
        {
          label: 'Suivi',
          name: 'followUp',
          default: this.defaultTab === 'followUp',
          component: ELearningCourseFollowUp,
        },
        { label: 'Accès', name: 'access', default: this.defaultTab === 'access', component: ELearningCourseAccess },
      ],
    };
  },
  async created () {
    const course = await Courses.getById(this.courseId);
    this.courseName = get(course, 'subProgram.program.name');
  },
};
</script>
