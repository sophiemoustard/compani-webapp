<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select class="q-pl-sm" :options="companyFilterOptions" v-model="selectedCompany" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select class="q-pl-sm" :options="trainerFilterOptions" v-model="selectedTrainer" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select class="q-pl-sm" :options="programFilterOptions" v-model="selectedProgram" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3 reset-filters" @click="resetFilters"><span>Effacer les filtres</span></div>
    </div>

    <ni-trello :courses="coursesFiltered" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="courseCreationModal = true" />

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
          icon-right="add" @click="createCourse" />
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
import Trello from '@components/courses/Trello';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { INTRA, COURSE_TYPES, INTER_B2B } from '@data/constants';
import { filtersMixin } from '@mixins/filtersMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  mixins: [filtersMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
    'ni-trello': Trello,
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
      trainerOptions: [],
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
  },
  async created () {
    await Promise.all([this.refreshCourses(), this.refreshPrograms(), this.refreshCompanies(), this.refreshTrainers()]);
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
  },
}
</script>
