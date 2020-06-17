import { INTRA, INTER_B2B } from '@data/constants';

export const filtersMixin = {
  data () {
    return {
      selectedProgram: '',
      selectedTrainer: '',
      selectedCompany: '',
    }
  },
  computed: {
    companyFilterOptions () {
      return [{ label: 'Toutes les structures', value: '' }, ...this.companyOptions];
    },
    trainerFilterOptions () {
      return [{ label: 'Tous les intervenants', value: '' }, ...this.trainerOptions];
    },
    programFilterOptions () {
      return [{ label: 'Tous les programmes', value: '' }, ...this.programOptions];
    },
    coursesFiltered () {
      let courses = this.coursesWithGroupedSlot;
      if (this.selectedProgram) {
        courses = courses.filter(course => course.program._id === this.selectedProgram);
      }
      if (this.selectedTrainer) {
        courses = courses.filter(course => course.trainer && course.trainer._id === this.selectedTrainer);
      }
      if (this.selectedCompany) {
        courses = courses.filter(course => (course.type === INTRA && course.company._id === this.selectedCompany) ||
          (course.type === INTER_B2B && course.trainees.some(trainee => trainee.company === this.selectedCompany)));
      }
      return courses;
    },
  },
  methods: {
    resetFilters () {
      this.selectedTrainer = '';
      this.selectedCompany = '';
      this.selectedProgram = '';
    },
  },
}
