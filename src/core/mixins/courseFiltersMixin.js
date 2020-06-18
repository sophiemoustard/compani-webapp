import Users from '@api/Users';
import { INTRA, INTER_B2B, TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

export const courseFiltersMixin = {
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
      return [
        { label: 'Tous les intervenants', value: '' },
        { label: 'Sans intervenant', value: 'without_trainer' },
        ...this.trainerOptions,
      ];
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
        courses = courses.filter(course => course.trainer
          ? course.trainer._id === this.selectedTrainer
          : this.selectedTrainer === 'without_trainer');
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
    async refreshTrainers () {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerOptions = trainers.filter(trainer =>
          this.coursesFiltered.some(course => course.trainer && course.trainer._id === trainer._id)
        )
          .map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }));
      } catch (e) {
        console.error(e);
      }
    },
  },
}
