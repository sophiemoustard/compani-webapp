<template>
  <ni-profile-header :title="title" class="delete-container" :header-info="headerInfo">
    <template #title v-if="!isClientInterface">
      <ni-button icon="delete" @click="deleteCourse" />
      <ni-button :flat="false" v-if="isAdmin" class="q-ml-sm" :label="archiveLabel" @click="validateCourseArchive" />
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
    isAdmin () {
      const vendorRole = this.$store.getters['main/getVendorRole'];
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole);
    },
    archiveLabel () {
      return !this.course.archivedAt ? 'Archiver' : 'Désarchiver';
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
      const message = !this.course.archivedAt
        ? 'Êtes-vous sûr(e) de vouloir archiver cette formation&nbsp;? <br /><br /> Vous ne pourrez plus'
        + ' modifier des informations, ajouter des émargements ni envoyer des sms.'
        : 'Êtes-vous sûr(e) de vouloir désarchiver cette formation&nbsp;? <br /><br /> Il sera de nouveau possible de'
        + ' modifier des informations, ajouter des émargements ou envoyer des sms.';
      this.$q.dialog({
        title: 'Confirmation',
        message,
        html: true,
        ok: 'Oui',
        cancel: 'Non',
      }).onOk(this.archiveOrUnarchiveCourse)
        .onCancel(() => NotifyPositive(!this.course.archivedAt ? 'Archivage annulé.' : 'Désarchivage annulé.'));
    },
    async archiveOrUnarchiveCourse () {
      try {
        const payload = !this.course.archivedAt ? { archivedAt: CompaniDate().toISO() } : { archivedAt: '' };
        await Courses.update(this.course._id, payload);

        NotifyPositive(!this.course.archivedAt ? 'Formation archivée.' : 'Formation désarchivée.');
        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        NotifyNegative(
          !this.course.archivedAt
            ? 'Erreur lors de l\'archivage de la formation.'
            : 'Erreur lors du désarchivage de la formation.'
        );
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.delete-container
  position: relative
</style>
