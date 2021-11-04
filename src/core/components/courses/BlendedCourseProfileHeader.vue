<template>
  <ni-profile-header :title="title" class="delete-container" :header-info="headerInfoWithArchived">
    <template #title v-if="!isClientInterface">
      <ni-button icon="delete" @click="deleteCourse" :disabled="disableCourseDeletion" />
      <ni-button :flat="false" v-if="displayArchiveButton" class="q-ml-sm"
        label="Archiver" @click="validateCourseArchive" />
    </template>
  </ni-profile-header>
</template>

<script>
import ProfileHeader from '@components/ProfileHeader';
import Button from '@components/Button';
import moment from '@helpers/moment';
import get from 'lodash/get';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Courses from '@api/Courses';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';

export default {
  name: 'BlendedCourseProfileHeader',
  props: {
    title: { type: String, required: true },
    disableCourseDeletion: { type: Boolean, default: true },
    headerInfo: { type: Array, required: true },
    course: { type: Object, default: () => ({}) },
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
  computed: {
    areAllCourseSlotsEnded () {
      return get(this, 'course') &&
        this.course.slots.every(slot => moment().isAfter(slot.endDate)) && !this.course.slotsToPlan.length;
    },
    courseId () {
      return get(this, 'course._id');
    },
    headerInfoWithArchived () {
      return [
        ...this.headerInfo,
        ...(get(this, 'course.archivedAt') ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
      ];
    },
    isAdmin () {
      const vendorRole = this.$store.getters['main/getVendorRole'];
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole);
    },
    displayArchiveButton () {
      return !this.course.archivedAt && this.areAllCourseSlotsEnded && this.isAdmin;
    },
  },
  methods: {
    deleteCourse () {
      this.$emit('delete');
    },
    refreshCourse () {
      this.$emit('refresh');
    },
    validateCourseArchive () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir archiver cette formation&nbsp;? <br /><br /> Vous ne pourrez plus'
        + ' modifier des informations, ajouter des émargements ni envoyer des sms.',
        html: true,
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(this.archiveCourse)
        .onCancel(() => NotifyPositive('Archivage annulé.'));
    },
    async archiveCourse () {
      try {
        const payload = { archivedAt: new Date() };
        await Courses.update(this.course._id, payload);

        NotifyPositive('Formation archivée.');
        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'archivage de la formation.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.delete-container
  position: relative
</style>
