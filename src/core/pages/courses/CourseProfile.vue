<template>
  <q-page padding :class="backgroundClass">
    <template v-if="course">
      <ni-profile-header :title="courseName">
        <template v-slot:body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side><q-icon size="xs" :name="info.icon" /></q-item-section>
              <q-item-section>{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
      <div v-if="isClientInterface && isCourseInter">
        <ni-profile-organization :profile-id="courseId" />
      </div>
      <div v-else>
        <profile-tabs :profile-id="courseId" :tabs-content="tabsContent" />
      </div>
    </template>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileFollowUp from '@components/courses/ProfileFollowUp';
import { INTER_B2B } from '@data/constants';
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
    'ni-profile-organization': ProfileOrganization,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

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
          default: this.defaultTab === 'followUp',
          component: ProfileFollowUp,
        },
      ],
      isClientInterface,
      backgroundClass: isClientInterface ? 'client-background' : 'vendor-background',
    };
  },
  computed: {
    ...mapState('course', ['course']),
    isCourseInter () {
      return this.course.type === INTER_B2B;
    },
    headerInfo () {
      const infos = [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];

      return infos;
    },
  },
  watch: {
    course () {
      this.courseName = this.composeCourseName(this.course, !this.isClientInterface);
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    this.courseName = this.composeCourseName(this.course, !this.isClientInterface);
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
  beforeDestroy () {
    this.$store.dispatch('course/resetCourse');
  },

};
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
