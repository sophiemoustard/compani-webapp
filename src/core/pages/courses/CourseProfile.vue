<template>
  <q-page padding :class="backgroundClass">
    <ni-profile-header :title="courseName">
      <template v-slot:body>
        <div class="row profile-info q-pl-lg">
          <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
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
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import { courseMixin } from '@mixins/courseMixin';

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
      courseName: '',
      tabsContent: [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        {
          label: 'Suivi',
          name: 'followUp',
          default: this.defaultTab === 'course',
          component: ProfileFollowUp,
        },
      ],
      backgroundClass: /\/ad\//.test(this.$router.currentRoute.path) ? 'vendor-background' : 'client-background',
    }
  },
  computed: {
    ...mapState('course', ['course']),
  },
  watch: {
    course () {
      this.courseName = get(this.course, 'name') || '';
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    this.courseName = get(this.course, 'name') || '';
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
    this.$store.dispatch('course/reset');
  },

}
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
