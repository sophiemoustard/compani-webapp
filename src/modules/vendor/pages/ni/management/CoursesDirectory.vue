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
      <ni-option-group v-model="newCourse.type" type="radio" :options="courseTypes" :error="$v.newCourse.type.$error"
        caption="Type" required-field inline @input="updateCourseCompany" />
      <ni-input in-modal v-model.trim="newCourse.name" :error="$v.newCourse.name.$error"
        @blur="$v.newCourse.name.$touch" required-field caption="Nom" />
      <ni-select in-modal v-model.trim="newCourse.program" :error="$v.newCourse.program.$error"
        @blur="$v.newCourse.program.$touch" required-field caption="Programme" :options="programOptions" />
      <ni-select v-if="isIntraCourse" in-modal v-model.trim="newCourse.company" :error="$v.newCourse.company.$error"
        @blur="$v.newCourse.company.$touch" required-field caption="Structure" :options="companyOptions" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCourse" :disable="$v.newCourse.$invalid" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import pickBy from 'lodash/pickBy';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import TitleHeader from '@components/TitleHeader';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { TRAINER, INTRA, COURSE_TYPES, INTER_B2B } from '@data/constants';
import CourseContainer from 'src/modules/vendor/components/courses/CourseContainer';
import { courseMixin } from 'src/modules/vendor/mixins/courseMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  mixins: [courseMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'course-container': CourseContainer,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      modalLoading: false,
      newCourse: {
        program: '',
        company: '',
        name: '',
        type: INTRA,
      },
      courseCreationModal: false,
      coursesWithGroupedSlot: [],
      programOptions: [],
      companyOptions: [],
      courseTypes: COURSE_TYPES,
    }
  },
  validations () {
    return {
      newCourse: {
        program: { required },
        company: { required: requiredIf((item) => { return item.type === INTRA; }) },
        name: { required },
        type: { required },
      },
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    isIntraCourse () {
      return this.newCourse.type === INTRA;
    },
    trello () {
      return [
        { title: 'À venir', courses: this.courseListForthcoming },
        { title: 'En cours', courses: this.courseListInProgress },
        { title: 'Terminée(s)', courses: this.courseListCompleted },
      ]
    },
    courseListForthcoming () {
      return this.coursesWithGroupedSlot
        .filter(this.isForthcoming)
        .sort((a, b) => this.getRangeNowToStartCourse(a) - this.getRangeNowToStartCourse(b));
    },
    courseListInProgress () {
      return this.coursesWithGroupedSlot
        .filter(this.isInProgress)
        .sort((a, b) => this.getRangeNowToNextSlot(a) - this.getRangeNowToNextSlot(b));
    },
    courseListCompleted () {
      return this.coursesWithGroupedSlot
        .filter(this.isCompleted)
        .sort((a, b) => this.getRangeNowToEndCourse(a) - this.getRangeNowToEndCourse(b));
    },
  },
  async created () {
    await this.refreshCourses();
    if (this.isAdmin) await Promise.all([this.refreshPrograms(), this.refreshCompanies()]);
  },
  methods: {
    async refreshCourses () {
      try {
        const params = {};
        if (this.vendorRole === TRAINER) params.trainer = this.loggedUser._id;

        const courses = await Courses.list(params);
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
    updateCourseCompany () {
      if (this.newCourse.type === INTER_B2B) delete this.newCourse.company;
    },
    resetCreationModal () {
      this.$v.newCourse.$reset();
      this.newCourse = { program: '', company: '', name: '', type: INTRA };
    },
    async createCourse () {
      try {
        this.$v.newCourse.$touch();
        if (this.$v.newCourse.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Courses.create(pickBy(this.newCourse));

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
    getRangeNowToStartCourse (course) {
      if (course.slots.length === 0) return Number.MAX_SAFE_INTEGER;

      const firstSlot = course.slots[0];
      return this.$moment(firstSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToNextSlot (course) {
      const nextSlot = course.slots.filter((daySlots) => !this.happened(daySlots))[0];
      return this.$moment(nextSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToEndCourse (course) {
      const lastSlot = course.slots[course.slots.length - 1];
      return this.$moment().diff(this.$moment(lastSlot[0].startDate), 'd', true);
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
