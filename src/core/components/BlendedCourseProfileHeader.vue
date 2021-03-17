<template>
  <ni-profile-header :title="title">
    <template #body>
      <div class="row profile-info q-pl-lg">
        <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
          <q-item-section side><q-icon size="xs" :name="info.icon" /></q-item-section>
          <q-item-section>{{ info.label }}</q-item-section>
        </q-item>
      </div>
    </template>
  </ni-profile-header>
</template>

<script>
import ProfileHeader from '@components/ProfileHeader';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';

export default {
  name: 'BlendedCourseProfileHeader',
  mixins: [blendedCourseProfileMixin],
  props: {
    title: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
  },
};
</script>
