<template>
    <q-page v-if="course" class="client-background" padding>
      <ni-profile-header :title="courseName" :header-info="headerInfo" />
      <profile-follow-up :profile-id="courseId" />
    </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapState } from 'vuex';
import get from 'lodash/get';
import { formatDurationFromFloat } from '@helpers/date';
import ProfileHeader from '@components/ProfileHeader';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import { NotifyNegative } from '@components/popup/notify';

const metaInfo = { title: 'Fiche formation' };

export default {
  name: 'ELearningCourseProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-follow-up': ProfileFollowUp,
  },
  props: {
    courseId: { type: String, required: true },
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState('course', ['course']),
    courseName () {
      return get(this.course, 'subProgram.program.name');
    },
    headerInfo () {
      return [{
        icon: 'hourglass_empty',
        label: `Durée: ${formatDurationFromFloat(this.course.totalTheoreticalHours)}`,
      }];
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
