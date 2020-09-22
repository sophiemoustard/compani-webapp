<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations mixtes" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :options="companyFilterOptions" v-model="selectedCompany" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="trainerFilterOptions"
          v-model="selectedTrainer" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="programFilterOptions"
          v-model="selectedProgram" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3 reset-filters" @click="resetFilters">
        <span>Effacer les filtres</span>
      </div>
    </div>

    <ni-trello :courses="coursesFiltered" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="courseCreationModal = true" />

    <!-- Course creation modal -->
    <course-creation-modal v-model="courseCreationModal" :new-course="newCourse" :is-intra-course="isIntraCourse"
      :programs="programs" :company-options="companyOptions" :validations="$v.newCourse" :loading="modalLoading"
      @hide="resetCreationModal" @submit="createCourse" @update="updateCourseCompany" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import omit from 'lodash/omit';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import CourseCreationModal from 'src/modules/vendor/components/courses/CourseCreationModal';
import Trello from '@components/courses/Trello';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { INTRA, COURSE_TYPES, INTER_B2B } from '@data/constants';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'course-creation-modal': CourseCreationModal,
    'ni-trello': Trello,
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
      },
      programs: [],
      courseCreationModal: false,
      coursesWithGroupedSlot: [],
      courseTypes: COURSE_TYPES,
    };
  },
  validations () {
    return {
      newCourse: {
        program: { required },
        subProgram: { required },
        company: { required: requiredIf(item => item.type === INTRA) },
        type: { required },
      },
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    isIntraCourse () {
      return this.newCourse.type === INTRA;
    },
  },
  async created () {
    await Promise.all([this.refreshCourses(), this.refreshPrograms(), this.refreshCompanies()]);
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list();
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
        this.companyOptions = companies
          .map(c => ({ label: c.name, value: c._id }))
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
      this.newCourse = { program: '', company: '', misc: '', type: INTRA };
    },
    async createCourse () {
      try {
        this.$v.newCourse.$touch();
        if (this.$v.newCourse.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Courses.create(omit(this.newCourse, 'program'));

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
  },
};
</script>
