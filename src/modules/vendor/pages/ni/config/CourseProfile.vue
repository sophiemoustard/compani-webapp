<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="course.name" />
    <profile-tabs :profile-id="courseId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import Course from '@api/Courses';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileProgram from 'src/modules/vendor/components/courses/ProfileProgram';

export default {
  name: 'CourseProfile',
  metadata: { title: 'Fiche formation' },
  props: {
    courseId: { type: String },
    defaultTab: { type: String, default: 'program' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      course: {},
      tabsContent: [
        {
          label: 'Programme',
          name: 'program',
          default: this.defaultTab === 'program',
          component: ProfileProgram,
        },
      ],
    }
  },
  async mounted () {
    await this.refreshCourse();
  },
  methods: {
    async refreshCourse () {
      try {
        this.course = await Course.get(this.courseId);
      } catch (e) {
        console.error(e);
        this.course = {};
      }
    },
  },
}
</script>
