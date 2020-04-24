<template>
  <q-page class="neutral-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="trello">
      <course-container v-for="col in trello" :title="col.title" :courses="col.courses" :key="col.title" />
    </div>
    <q-btn v-if="isAdmin" class="fixed fab-custom" no-caps rounded color="primary" icon="add"
      label="Ajouter une formation" @click="courseCreationModal = true" />

    <!-- Course creation modal -->
    <ni-modal v-model="courseCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-input in-modal v-model.trim="newCourse.name" :error="$v.newCourse.name.$error"
        @blur="$v.newCourse.name.$touch" required-field caption="Nom" />
      <ni-select in-modal v-model.trim="newCourse.program" :error="$v.newCourse.program.$error"
        @blur="$v.newCourse.program.$touch" required-field caption="Programme" :options="programOptions" />
      <ni-select in-modal v-model.trim="newCourse.companies" :error="$v.newCourse.companies.$error"
        @blur="$v.newCourse.companies.$touch" required-field caption="Structure" :options="companyOptions" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCourse" :disable="$v.newCourse.$invalid" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import TitleHeader from '@components/TitleHeader';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';
import CourseContainer from 'src/modules/vendor/components/courses/CourseContainer';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'course-container': CourseContainer,
  },
  data () {
    return {
      modalLoading: false,
      newCourse: {
        program: '',
        companies: '',
        name: '',
        type: 'intra',
      },
      courseCreationModal: false,
      coursesWithGroupedSlot: [],
      programOptions: [],
      companyOptions: [],
    }
  },
  validations () {
    return {
      newCourse: {
        program: { required: true },
        companies: { required: true },
        name: { required: true },
        type: { required: true },
      },
    }
  },
  computed: {
    ...mapGetters({ vendorRole: 'main/vendorRole' }),
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    trello () {
      return [
        { title: 'À venir', courses: this.courseListForthcoming },
        { title: 'En cours', courses: this.courseListInProgress },
        { title: 'Terminée(s)', courses: this.courseListCompleted },
      ]
    },
    courseListForthcoming () {
      return this.coursesWithGroupedSlot.filter(this.isForthcoming);
    },
    courseListInProgress () {
      return this.coursesWithGroupedSlot.filter(this.isInProgress);
    },
    courseListCompleted () {
      return this.coursesWithGroupedSlot.filter(this.isCompleted);
    },
  },
  async created () {
    await this.refreshCourses();
    if (this.isAdmin) await Promise.all([this.refreshPrograms(), this.refreshCompanies()]);
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list();
        this.coursesWithGroupedSlot = courses.map(course => ({
          ...course,
          slots: Object.values(groupBy(course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'))),
        }));
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
    async refreshPrograms () {
      try {
        const programs = await Programs.list();
        this.programOptions = programs
          .map(p => ({ label: p.name, value: p._id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.programOptions = [];
      }
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = companies
          .map(c => ({ label: c.tradeName, value: c._id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    resetCreationModal () {
      this.$v.newCourse.$reset();
      this.newCourse = { program: '', companies: '', name: '', type: 'intra' };
    },
    formatCourseCreationPayload (newCourse) {
      return { ...newCourse, companies: [newCourse.companies] };
    },
    async createCourse () {
      try {
        this.modalLoading = true;
        const payload = this.formatCourseCreationPayload(this.newCourse);
        await Courses.create(payload);

        this.courseCreationModal = false;
        NotifyPositive('Formation créée.')
        await this.refreshCourses();
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de créer la formation.');
      } finally {
        this.modalLoading = false;
      }
    },
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
    isForthcoming (course) {
      const noSlot = !course.slots.length;
      const noSlotHappened = !course.slots.some(this.happened);

      return noSlot || noSlotHappened;
    },
    isInProgress (course) {
      const atLeastOneSlot = course.slots.length;
      const atLeastOneSlothappened = course.slots.some(this.happened);
      const notEverySlotsHappened = course.slots.some((sameDaySlots) => !this.happened(sameDaySlots));

      return atLeastOneSlot && atLeastOneSlothappened && notEverySlotsHappened;
    },
    isCompleted (course) {
      const atLeastOneSlot = course.slots.length;
      const everySlotsHappened = course.slots.every(this.happened);

      return atLeastOneSlot && everySlotsHappened;
    },
  },
}
</script>

<style lang="stylus" scoped>
.trello
  overflow: auto;
  display: flex
  flex-direction: row
  @media screen and (min-width: 768px)
    justify-content: space-between
</style>
