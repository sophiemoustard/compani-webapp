<template>
  <ni-profile-header :title="title" class="delete-container" :header-info="headerInfoWithArchived">
    <template #title v-if="!isClientInterface">
      <ni-button icon="delete" @click="deleteCourse" :disabled="disableCourseDeletion" />
      <ni-button :flat="false" v-if="!course.archivedAt && areAllCourseSlotsEnded && isAdmin" class="q-ml-sm"
        label="Archiver" @click="validateCourseArchive" />
    </template>
  </ni-profile-header>
</template>

<script>
import ProfileHeader from '@components/ProfileHeader';
import Button from '@components/Button';
import moment from '@helpers/moment';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Courses from '@api/Courses';
import { blendedCourseProfileMixin } from '@mixins/blendedCourseProfileMixin';

export default {
  name: 'BlendedCourseProfileHeader',
  mixins: [blendedCourseProfileMixin],
  props: {
    title: { type: String, required: true },
    disableCourseDeletion: { type: Boolean, default: true },
    headerInfo: { type: Array, required: true },
    isAdmin: { type: Boolean, default: false },
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
      return this.course?.slots.every(slot => moment().isAfter(slot.endDate)) && !this.course.slotsToPlan.length;
    },
    courseId () {
      return this.course?._id;
    },
    headerInfoWithArchived () {
      return [
        ...this.headerInfo,
        ...(this.course?.archivedAt ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
      ];
    },
  },
  methods: {
    deleteCourse () {
      this.$emit('delete');
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
.q-item
  padding: 0
  min-height: 0

.delete-container
  position: relative
</style>
