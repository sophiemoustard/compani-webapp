import uniqBy from 'lodash/uniqBy';
import { formatIdentity } from '@helpers/utils';
import { INTER_B2B, INTRA } from '@data/constants';

export const courseFiltersMixin = {
  data () {
    return {
      programOptions: [],
      companyOptions: [],
      selectedProgram: '',
      selectedTrainer: '',
      selectedCompany: '',
    }
  },
  computed: {
    companyFilterOptions () {
      const companies = [];

      for (const course of this.coursesWithGroupedSlot) {
        if (course.type === INTRA) companies.push({ label: course.company.name, value: course.company._id });
        else {
          for (const trainee of course.trainees) {
            companies.push({ label: trainee.company.name, value: trainee.company._id });
          }
        }
      }

      const sortedCompanies = uniqBy(companies, 'value').sort((a, b) => a.label.localeCompare(b.label));

      return [{ label: 'Toutes les structures', value: '' }, ...sortedCompanies];
    },
    trainerFilterOptions () {
      const trainers = this.coursesWithGroupedSlot
        .filter(course => !!course.trainer)
        .map(course => ({ label: formatIdentity(course.trainer.identity, 'FL'), value: course.trainer._id }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [
        { label: 'Tous les intervenants', value: '' },
        { label: 'Sans intervenant', value: 'without_trainer' },
        ...uniqBy(trainers, 'value'),
      ];
    },
    programFilterOptions () {
      const programs = this.coursesWithGroupedSlot
        .map(course => ({ label: course.program.name, value: course.program._id }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [{ label: 'Tous les programmes', value: '' }, ...uniqBy(programs, 'value')];
    },
  },
  methods: {
    resetFilters () {
      this.selectedTrainer = '';
      this.selectedCompany = '';
      this.selectedProgram = '';
    },
    filterCoursesByProgram (courses) {
      return courses.filter(course => course.program._id === this.selectedProgram);
    },
    filterCoursesByTrainer (courses) {
      return courses.filter(course => course.trainer
        ? course.trainer._id === this.selectedTrainer
        : this.selectedTrainer === 'without_trainer');
    },
    filterCoursesByCompany (courses) {
      return courses.filter(course => (course.type === INTRA && course.company._id === this.selectedCompany) ||
      (course.type === INTER_B2B && course.trainees.some(trainee => trainee.company._id === this.selectedCompany)));
    },
  },
}
