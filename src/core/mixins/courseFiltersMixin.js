import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
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
    };
  },
  computed: {
    coursesFiltered () {
      let courses = this.coursesWithGroupedSlot;
      if (this.selectedProgram) courses = this.filterCoursesByProgram(courses);

      if (this.selectedTrainer) courses = this.filterCoursesByTrainer(courses);

      if (this.selectedCompany) courses = this.filterCoursesByCompany(courses);

      return courses;
    },
    companyFilterOptions () {
      const companies = [];

      for (const course of this.coursesWithGroupedSlot) {
        if (course.type === INTRA && !companies.some(company => company.value === course.company._id)) {
          companies.push({ label: course.company.name, value: course.company._id });
        } else {
          for (const trainee of course.trainees) {
            if (!companies.some(company => company.value === trainee.company._id)) {
              companies.push({ label: trainee.company.name, value: trainee.company._id });
            }
          }
        }
      }
      return [
        { label: 'Toutes les structures', value: '' },
        ...companies.sort((a, b) => a.label.localeCompare(b.label)),
      ];
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
      return courses.filter(course => (course.trainer
        ? course.trainer._id === this.selectedTrainer
        : this.selectedTrainer === 'without_trainer'));
    },
    filterCoursesByCompany (courses) {
      return courses.filter(course => (course.type === INTRA && course.company._id === this.selectedCompany) ||
      (course.type === INTER_B2B && course.trainees.some(trainee => trainee.company._id === this.selectedCompany)));
    },
    groupByCourses (courses) {
      return courses.map(course => ({
        ...course,
        slots: course.slots.length
          ? Object.values(groupBy(course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY')))
          : [],
        slotsToPlan: course.slotsToPlan || [],
      }));
    },
  },
};
