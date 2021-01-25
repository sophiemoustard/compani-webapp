<template>
    <q-page class="client-background" padding>
      <ni-profile-header title="SKUUUUU" />
    </q-page>
</template>

<script>
import ProfileHeader from '@components/ProfileHeader';

export default {
  name: 'ELearningCourseProfile',
  components: {
    'ni-profile-header': ProfileHeader,
  },
  props: {
    courseId: { type: String, required: true },
  },
};
</script>
