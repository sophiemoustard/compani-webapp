import { mapState } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import { INTER_B2B, INTRA } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import moment from '@helpers/moment';
import { formatDate, isSameOrAfter, isSameOrBefore, isBetween } from '@helpers/date';

export const courseFiltersMixin = {
  data () {
    return {
      programOptions: [],
      companyOptions: [],
    };
  },
  computed: {
    ...mapState(
      'course',
      [
        'selectedTrainer',
        'selectedProgram',
        'selectedCompany',
        'selectedSalesRepresentative',
        'selectedStartDate',
        'selectedEndDate',
      ]
    ),
    coursesFiltered () {
      let courses = this.coursesWithGroupedSlot;
      if (this.selectedProgram) courses = this.filterCoursesByProgram(courses);

      if (this.selectedTrainer) courses = this.filterCoursesByTrainer(courses);

      if (this.selectedCompany) courses = this.filterCoursesByCompany(courses);

      if (this.selectedSalesRepresentative) courses = this.filterCoursesBySalesRepresentative(courses);

      if (!this.displayArchived) courses = this.filterArchivedCourses(courses);

      if (this.selectedStartDate && !this.selectedEndDate) courses = this.filterCoursesByStartDate(courses);

      if (this.selectedEndDate && !this.selectedStartDate) courses = this.filterCoursesByEndDate(courses);

      if (this.selectedEndDate && this.selectedStartDate) courses = this.filterCoursesByStartDateAndEndDate(courses);

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
      const filteredCourses = this.coursesWithGroupedSlot.filter(course => !!course.trainer);
      const trainers = formatAndSortIdentityOptions(filteredCourses, 'trainer');

      return [
        { label: 'Tous les intervenants', value: '' },
        { label: 'Sans intervenant(e)', value: 'without_trainer' },
        ...uniqBy(trainers, 'value'),
      ];
    },
    programFilterOptions () {
      const programs = this.coursesWithGroupedSlot
        .map(course => ({ label: course.subProgram.program.name, value: course.subProgram.program._id }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [{ label: 'Tous les programmes', value: '' }, ...uniqBy(programs, 'value')];
    },
    salesRepresentativesFilterOptions () {
      const filteredCourses = this.coursesWithGroupedSlot.filter(course => !!course.salesRepresentative);
      const salesRepresentatives = formatAndSortIdentityOptions(filteredCourses, 'salesRepresentative');

      return [
        { label: 'Tous les référents Compani', value: '' },
        { label: 'Sans référent(e) Compani', value: 'without_sales_representative' },
        ...uniqBy(salesRepresentatives, 'value'),
      ];
    },
  },
  methods: {
    updateSelectedTrainer (trainerId) {
      this.$store.dispatch('course/setSelectedTrainer', { trainerId });
    },
    updateSelectedProgram (programId) {
      this.$store.dispatch('course/setSelectedProgram', { programId });
    },
    updateSelectedCompany (companyId) {
      this.$store.dispatch('course/setSelectedCompany', { companyId });
    },
    updateSelectedSalesRepresentative (salesRepresentativeId) {
      this.$store.dispatch('course/setSelectedSalesRepresentative', { salesRepresentativeId });
    },
    updateSelectedStartDate (startDate) {
      this.$store.dispatch('course/setSelectedStartDate', { startDate: moment(startDate).startOf('d').toISOString() });
    },
    updateSelectedEndDate (endDate) {
      this.$store.dispatch('course/setSelectedEndDate', { endDate: moment(endDate).endOf('d').toISOString() });
    },
    resetFilters () {
      this.$store.dispatch('course/resetFilters');
    },
    filterCoursesByProgram (courses) {
      return courses.filter(course => course.subProgram.program._id === this.selectedProgram);
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
    filterCoursesBySalesRepresentative (courses) {
      return courses.filter(course => (course.salesRepresentative
        ? course.salesRepresentative._id === this.selectedSalesRepresentative
        : this.selectedSalesRepresentative === 'without_sales_representative'));
    },
    filterArchivedCourses (courses) {
      return courses.filter(course => !course.archivedAt);
    },
    filterCoursesByStartDate (courses) {
      return courses
        .filter(course => (!course.slots.length && isSameOrAfter(course.estimatedStartDate, this.selectedStartDate)) ||
          (course.slots.some(slotGroup => slotGroup.some(s => isSameOrAfter(s.startDate, this.selectedStartDate)))));
    },
    filterCoursesByEndDate (courses) {
      return courses
        .filter(course => (!course.slots.length && isSameOrBefore(course.estimatedStartDate, this.selectedEndDate)) ||
          (course.slots.some(slotGroup => slotGroup.some(s => isSameOrBefore(s.endDate, this.selectedEndDate)))));
    },
    filterCoursesByStartDateAndEndDate (courses) {
      return courses
        .filter((course) => {
          const hasEstimationInRange = !course.slots.length &&
            isBetween(course.estimatedStartDate, this.selectedStartDate, this.selectedEndDate);
          const hasSlotsInRange = course.slots
            .some(slotGroup => slotGroup.some(s => isBetween(s.endDate, this.selectedStartDate, this.selectedEndDate)));

          return hasEstimationInRange || hasSlotsInRange;
        });
    },
    groupByCourses (courses) {
      return courses.map(course => ({
        ...course,
        slots: course.slots.length ? Object.values(groupBy(course.slots, s => formatDate(s.startDate))) : [],
        slotsToPlan: course.slotsToPlan || [],
      }));
    },
  },
};
