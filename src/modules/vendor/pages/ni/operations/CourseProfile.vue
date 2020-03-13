<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="courseName" />
    <profile-tabs :profile-id="courseId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileOrganization from 'src/modules/vendor/components/courses/ProfileOrganization';

export default {
  name: 'CourseProfile',
  metadata: { title: 'Fiche formation' },
  props: {
    courseId: { type: String },
    defaultTab: { type: String, default: 'course' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      courseName: '',
      tabsContent: [
        {
          label: 'Organisation de la session',
          name: 'course',
          default: this.defaultTab === 'course',
          component: ProfileOrganization,
        },
      ],
    }
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
  },
  watch: {
    course () {
      this.courseName = get(this.course, 'name') || '';
    },
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
    else this.courseName = '';
  },
  methods: {
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/getCourse', { courseId: this.courseId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.commit('course/saveCourse', null);
  },

}
</script>
