<template>
    <q-page class="vendor-background" padding>
      <ni-profile-header :title="courseName" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { shallowRef } from 'vue';
import { mapState } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import ProfileAccess from 'src/modules/vendor/components/courses/ProfileAccess';
import ProfileQuestionnaires from 'src/modules/vendor/components/courses/ProfileQuestionnaires';
import { NotifyNegative } from '@components/popup/notify';

const metaInfo = { title: 'Fiche formation' };

export default {
  name: 'ELearningCourseProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'followUp' },
  },
  mixins: [createMetaMixin(metaInfo)],
  computed: {
    ...mapState('course', ['course']),
    courseName () {
      return get(this.course, 'subProgram.program.name');
    },
  },
  data () {
    return {
      tabsContent: [
        {
          label: 'Suivi',
          name: 'followUp',
          default: this.defaultTab === 'followUp',
          component: shallowRef(ProfileFollowUp),
        },
        {
          label: 'Questionnaires',
          name: 'questionnaires',
          default: this.defaultTab === 'questionnaires',
          component: shallowRef(ProfileQuestionnaires),
        },
        { label: 'Accès', name: 'access', default: this.defaultTab === 'access', component: shallowRef(ProfileAccess) },
      ],
    };
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
