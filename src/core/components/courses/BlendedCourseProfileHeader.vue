<template>
  <ni-profile-header :title="title" class="delete-container" :header-info="headerInfo">
    <template #title v-if="!isClientInterface">
      <ni-button icon="delete" @click="deleteCourse" />
      <ni-button :flat="false" v-if="displayArchiveButton" class="q-ml-sm"
        label="Archiver" @click="validateCourseArchive" />
    </template>
  </ni-profile-header>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import ProfileHeader from '@components/ProfileHeader';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'BlendedCourseProfileHeader',
  props: {
    title: { type: String, required: true },
    headerInfo: { type: Array, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-button': Button,
  },
  emits: ['delete', 'refresh'],
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      isClientInterface,
    };
  },
  computed: {
    ...mapState('course', ['course']),
    courseId () {
      return this.course._id;
    },
    displayArchiveButton () {
      const vendorRole = this.$store.getters['main/getVendorRole'];
      const isAdmin = [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole);
      const areAllCourseSlotsEnded = this.course.slots.every(slot => CompaniDate().isAfter(slot.endDate)) &&
        !this.course.slotsToPlan.length;

      return !this.course.archivedAt && areAllCourseSlotsEnded && isAdmin;
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
        const payload = { archivedAt: CompaniDate().toISO() };
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

<style lang="sass" scoped>
.delete-container
  position: relative
</style>
