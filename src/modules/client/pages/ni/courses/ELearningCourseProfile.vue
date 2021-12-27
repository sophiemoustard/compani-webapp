<template>
    <q-page class="client-background" padding>
      <ni-profile-header :title="courseName" />
      <profile-follow-up :profile-id="courseId" />
    </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import { NotifyNegative } from '@components/popup/notify';

export default {
  name: 'ELearningCourseProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    courseId: { type: String, required: true },
  },
  computed: {
    ...mapState('course', ['course']),
    courseName () {
      return get(this.course, 'subProgram.program.name');
    },
  },
  async created () {
    await this.refreshCourse();
  },
  methods: {
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/fetchCourse', { courseId: this.courseId });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de la formation.');
      }
    },
  },
  beforeUnmount () {
    this.$store.dispatch('course/resetCourse');
  },
};
</script>
