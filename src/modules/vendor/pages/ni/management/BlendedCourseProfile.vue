<template>
  <q-page padding :class="backgroundClass">
    <template v-if="course">
      <ni-profile-header :title="courseName" class="delete-container">
        <template #title>
          <ni-button class="delete" icon="delete" @click="validateCourseDeletion" :disabled="disableCourseDeletion" />
        </template>
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
import Button from '@components/Button';
import ProfileTabs from '@components/ProfileTabs';
import ProfileOrganization from '@components/courses/ProfileOrganization';
import ProfileHeader from '@components/ProfileHeader';
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
    'ni-button': Button,
  },
};
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0

/deep/ h4
  margin-right: 32px !important

.delete-container
  position: relative

.delete
  position: absolute
  top: 0
  right: 0
</style>
