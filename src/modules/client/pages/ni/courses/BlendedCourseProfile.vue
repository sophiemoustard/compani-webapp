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
import { onBeforeUnmount, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import BlendedCourseProfileHeader from '@components/courses/BlendedCourseProfileHeader';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
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
    'profile-tabs': ProfileTabs,
    'ni-blended-course-profile-header': BlendedCourseProfileHeader,
  },
  setup (props) {
    const $store = useStore();
    const $route = useRoute();
    const course = computed(() => $store.state.course.course);
    const courseName = ref('');

    const tabsContent = [
      {
        label: 'Organisation',
        name: 'organization',
        default: props.defaultTab === 'organization',
        component: ProfileOrganization,
      },
      {
        label: 'Suivi des stagiaires',
        name: 'traineeFollowUp',
        default: props.defaultTab === 'traineeFollowUp',
        component: ProfileTraineeFollowUp,
      },
    ];

    onBeforeUnmount(() => {
      $store.dispatch('course/resetCourse');
      if ($route.name !== 'ni courses') $store.dispatch('course/resetFilters');
    });

    return {
      // Data
      courseName,
      tabsContent,
      // Computed
      course,
    };
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
  methods: {
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/fetchCourse', { courseId: this.courseId });
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>
