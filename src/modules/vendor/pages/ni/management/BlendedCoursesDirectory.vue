<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="displayArchived = !displayArchived" :display-search-bar="false" />
    <div class="filters-container">
      <ni-select :options="companyFilterOptions" :model-value="selectedCompany" clearable
        @update:model-value="updateSelectedCompany" />
      <ni-select :options="trainerFilterOptions" :model-value="selectedTrainer" clearable
        @update:model-value="updateSelectedTrainer" />
      <ni-select :options="programFilterOptions" :model-value="selectedProgram" clearable
        @update:model-value="updateSelectedProgram" />
      <ni-select :options="salesRepresentativesFilterOptions" :model-value="selectedSalesRepresentative"
        @update:model-value="updateSelectedSalesRepresentative" />
      <ni-date-input :model-value="selectedStartDate" @update:model-value="updateSelectedStartDate"
        placeholder="Début de période" :max="selectedEndDate" :error="v$.selectedStartDate.$error"
        error-message="La date de début doit être antérieure à la date de fin" @blur="v$.selectedStartDate.$touch" />
      <ni-date-input :model-value="selectedEndDate" @update:model-value="updateSelectedEndDate"
        placeholder="Fin de période" :min="selectedStartDate" :error="v$.selectedEndDate.$error"
        error-message="La date de fin doit être postérieure à la date de début" @blur="v$.selectedEndDate.$touch" />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <ni-trello :courses="coursesFiltered" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="openCourseCreationModal" />

    <course-creation-modal v-model="courseCreationModal" v-model:new-course="newCourse" :is-intra-course="isIntraCourse"
      :programs="programs" :company-options="companyOptions" :validations="v$.newCourse" :loading="modalLoading"
      @hide="resetCreationModal" @submit="createCourse" :sales-representative-options="salesRepresentativeOptions" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import { mapState } from 'vuex';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import DateInput from '@components/form/DateInput';
import Select from '@components/form/Select';
import CourseCreationModal from 'src/modules/vendor/components/courses/CourseCreationModal';
import Trello from '@components/courses/Trello';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { INTRA, COURSE_TYPES, BLENDED, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { formatAndSortOptions, formatAndSortIdentityOptions } from '@helpers/utils';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';

export default {
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-select': Select,
    'course-creation-modal': CourseCreationModal,
    'ni-trello': Trello,
    'ni-date-input': DateInput,
  },
  setup () {
    const metaInfo = { title: 'Catalogue' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  data () {
    return {
      modalLoading: false,
      newCourse: {
        program: '',
        subProgram: '',
        company: '',
        misc: '',
        type: INTRA,
        salesRepresentative: '',
        estimatedStartDate: '',
      },
      programs: [],
      courseCreationModal: false,
      coursesWithGroupedSlot: [],
      courseTypes: COURSE_TYPES,
      salesRepresentativeOptions: [],
      displayArchived: false,
    };
  },
  validations () {
    return {
      newCourse: {
        program: { required },
        subProgram: { required },
        company: { required: requiredIf(this.newCourse.type === INTRA) },
        type: { required },
        salesRepresentative: { required },
      },
      selectedStartDate: { maxDate: this.selectedEndDate ? maxDate(this.selectedEndDate) : '' },
      selectedEndDate: { minDate: this.selectedStartDate ? minDate(this.selectedStartDate) : '' },
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    isIntraCourse () {
      return this.newCourse.type === INTRA;
    },
  },
  async created () {
    await Promise.all([
      this.refreshCourses(),
      this.refreshPrograms(),
      this.refreshCompanies(),
      this.refreshSalesRepresentatives(),
    ]);
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list({ format: BLENDED });
        this.coursesWithGroupedSlot = this.groupByCourses(courses);
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
    async refreshPrograms () {
      try {
        this.programs = await Programs.list();
      } catch (e) {
        console.error(e);
        this.programs = [];
      }
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    async refreshSalesRepresentatives () {
      try {
        const salesRepresentative = await Users.list({ role: [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.salesRepresentativeOptions = formatAndSortIdentityOptions(salesRepresentative);
      } catch (e) {
        console.error(e);
        this.salesRepresentativeOptions = [];
      }
    },
    resetCreationModal () {
      this.v$.newCourse.$reset();
      this.newCourse = {
        program: '',
        company: '',
        misc: '',
        type: INTRA,
        salesRepresentative: '',
        estimatedStartDate: '',
      };
    },
    async createCourse () {
      try {
        this.v$.newCourse.$touch();
        if (this.v$.newCourse.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Courses.create(pickBy(omit(this.newCourse, 'program')));

        this.courseCreationModal = false;
        NotifyPositive('Formation créée.');
        await this.refreshCourses();
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de créer la formation.');
      } finally {
        this.modalLoading = false;
      }
    },
    openCourseCreationModal () {
      this.newCourse = { ...this.newCourse, salesRepresentative: this.loggedUser._id };
      this.courseCreationModal = true;
    },
  },
  beforeUnmount () {
    if (this.$route.name !== 'ni management blended courses info') {
      this.$store.dispatch('course/resetFilters');
    }
  },
};
</script>
