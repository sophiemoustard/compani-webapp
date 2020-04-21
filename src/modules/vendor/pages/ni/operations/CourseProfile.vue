<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="courseName">
      <template v-slot:body>
        <div class="profile-info col-mb-6 col-xs-12 q-pl-lg">
          <q-item v-for="info in headerInfo" :key="info.icon">
            <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
            <q-item-section class="text-capitalize">{{ info.label }}</q-item-section>
          </q-item>
        </div>
      </template>
    </ni-profile-header>
    <profile-tabs :profile-id="courseId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileOrganization from 'src/modules/vendor/components/courses/ProfileOrganization';
import ProfileFollowUp from 'src/modules/vendor/components/courses/ProfileFollowUp';

export default {
  name: 'CourseProfile',
  metadata: { title: 'Fiche formation' },
  props: {
    courseId: { type: String },
    defaultTab: { type: String, default: 'organization' },
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
          label: 'Organisation de la formation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        {
          label: 'Suivi de la formation',
          name: 'followUp',
          default: this.defaultTab === 'course',
          component: ProfileFollowUp,
        },
      ],
    }
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
    courseType () {
      return get(this.course, 'type') || '';
    },
    companyName () {
      if (!get(this.course, 'companies') || !this.course.companies.length) return '';
      return this.course.companies[0].tradeName || '';
    },
    programName () {
      return get(this.course, 'program.name') || '';
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: `${this.courseType}` },
        { icon: 'apartment', label: `${this.companyName}` },
        { icon: 'library_books', label: `${this.programName}` },
      ];
    },
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

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
