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
      const companies = this.companyOptions
        .filter(company => this.coursesWithGroupedSlot.some(course => {
          if (course.type === INTRA && company.value === course.company._id) return true;

          if (course.type === INTER_B2B) return course.trainees.some(trainee => trainee.company === company.value)
        }));

      return [{ label: 'Toutes les structures', value: '' }, ...companies];
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
  },
}
