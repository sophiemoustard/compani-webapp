<template>
  <ni-profile-header :title="title" class="delete-container">
    <template #title v-if="!isClientInterface">
      <ni-button class="delete" icon="delete" @click="deleteCourse" :disabled="disableCourseDeletion" />
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
</template>

<script>
import ProfileHeader from '@components/ProfileHeader';
import Button from '@components/Button';

export default {
  name: 'BlendedCourseProfileHeader',
  props: {
    title: { type: String, required: true },
    disableCourseDeletion: { type: Boolean, default: true },
    headerInfo: { type: Array, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-button': Button,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      isClientInterface,
    };
  },
  methods: {
    deleteCourse () {
      this.$emit('delete');
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

.delete-container
  position: relative

.delete
  position: absolute
  top: 0
  right: 0
</style>
