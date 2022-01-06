<template>
    <q-page class="vendor-background" padding>
      <ni-profile-header :title="courseName" />
      <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
    </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import ProfileAccess from 'src/modules/vendor/components/courses/ProfileAccess';
import ProfileQuestionnaires from 'src/modules/vendor/components/courses/ProfileQuestionnaires';
import { NotifyNegative } from '@components/popup/notify';

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
  setup (props) {
    const metaInfo = { title: 'Fiche formation' };
    useMeta(metaInfo);

    const tabsContent = [
      {
        label: 'Suivi',
        name: 'followUp',
        default: props.defaultTab === 'followUp',
        component: ProfileFollowUp,
      },
      {
        label: 'Questionnaires',
        name: 'questionnaires',
        default: props.defaultTab === 'questionnaires',
        component: ProfileQuestionnaires,
      },
      { label: 'Accès', name: 'access', default: props.defaultTab === 'access', component: ProfileAccess },
    ];

    const $store = useStore();
    const course = computed(() => $store.state.course.course);
    const courseName = computed(() => get(course.value, 'subProgram.program.name'));

    const refreshCourse = async () => {
      try {
        await $store.dispatch('course/fetchCourse', { courseId: props.courseId });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de la formation.');
      }
    };

    const created = async () => { await refreshCourse(); };

    onBeforeUnmount(() => { $store.dispatch('course/resetCourse'); });

    created();

    return {
      // Data
      tabsContent,
      // Computed
      course,
      courseName,
    };
  },
};
</script>
