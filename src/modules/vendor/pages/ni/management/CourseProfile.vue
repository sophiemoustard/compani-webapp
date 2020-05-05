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
import { mapState } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileOrganization from 'src/modules/vendor/components/courses/ProfileOrganization';
import ProfileFollowUp from 'src/modules/vendor/components/courses/ProfileFollowUp';
import { courseMixin } from 'src/modules/vendor/mixins/courseMixin';

export default {
  name: 'CourseProfile',
  metadata: { title: 'Fiche formation' },
  mixins: [courseMixin],
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
    ...mapState('course', ['course']),
    courseName () {
      return get(this.course, 'name') || '';
    },
    courseType () {
      return get(this.course, 'type') || '';
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: `${this.courseType}` },
        { icon: 'apartment', label: `${this.companyName}` },
        { icon: 'library_books', label: `${this.programName}` },
      ];
    },
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
  },
  methods: {
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/get', { courseId: this.courseId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.dispatch('course/remove');
  },

}
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
