<template>
  <q-page padding :class="backgroundClass">
    <template v-if="course">
      <ni-profile-header :title="courseName">
        <template v-slot:title>
          <ni-button icon="delete" @click="validateCourseDeletion" :disabled="disableCourseDeletion" />
        </template>
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
import Courses from '@api/Courses';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import ProfileTraineeFollowUp from '@components/courses/ProfileTraineeFollowUp';
import { INTER_B2B } from '@data/constants';
import { courseMixin } from '@mixins/courseMixin';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';

export default {
  name: 'BlendedCourseProfile',
  metadata: { title: 'Fiche formation' },
  mixins: [courseMixin],
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'organization' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
    'ni-profile-organization': ProfileOrganization,
    'ni-button': Button,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      courseName: '',
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
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];
    },
    tabsContent () {
      const tabs = [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin },
      ];
      if (!this.isClientInterface) {
        tabs.push({
          label: 'Suivi des stagiaires',
          name: 'traineeFollowUp',
          default: this.defaultTab === 'traineeFollowUp',
          component: ProfileTraineeFollowUp,
        });
      }

      return tabs;
    },
    disableCourseDeletion () {
      return !!this.course.slots.length || !!this.course.trainees.length;
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
    async deleteCourse () {
      try {
        await Courses.delete(this.course._id);
        NotifyPositive('Formation supprimée.');
        this.$router.push({ name: 'ni management blended courses' });
      } catch (e) {
        console.error(e);
        if (e.status === 403) NotifyNegative('Vous ne pouvez pas supprimer cette formation.');
        if (e.msg) NotifyNegative('Erreur lors de la suppression de la formation.');
      }
    },
    validateCourseDeletion () {
      if (this.deletionDisabled) return;
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Confirmez-vous la suppression ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteCourse)
        .onCancel(() => NotifyPositive('Suppression annulée'));
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
