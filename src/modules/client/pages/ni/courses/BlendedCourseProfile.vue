<template>
  <q-page padding :class="backgroundClass">
    <template v-if="course">
      <ni-profile-header :title="courseName">
        <template #body>
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
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileHeader from '@components/ProfileHeader';
import ProfileAdmin from '@components/courses/ProfileAdmin';
import { courseMixin } from '@mixins/courseMixin';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';

export default {
  name: 'BlendedCourseProfile',
  metadata: { title: 'Fiche formation' },
  mixins: [courseMixin, blendedCourseProfileMixin],
  props: {
    courseId: { type: String, required: true },
    defaultTab: { type: String, default: 'organization' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
    'ni-profile-organization': ProfileOrganization,
  },
  data () {
    return {
      backgroundClass: 'client-background',
    };
  },
  computed: {
    tabsContent () {
      return [
        {
          label: 'Organisation',
          name: 'organization',
          default: this.defaultTab === 'organization',
          component: ProfileOrganization,
        },
        { label: 'Admin', name: 'admin', default: this.defaultTab === 'admin', component: ProfileAdmin },
      ];
    },
  },
};
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0

/deep/ h4
  margin-right: 32px !important
</style>
