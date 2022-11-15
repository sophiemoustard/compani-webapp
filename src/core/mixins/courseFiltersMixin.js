import { mapState } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import { INTER_B2B, INTRA, DD_MM_YYYY } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';

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
        if (course.type === INTRA && !companies.some(company => company.value === course.companies[0]._id)) {
          const { name, _id } = course.companies[0];
          companies.push({ label: name, value: _id });
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
      this.$store.dispatch('course/setSelectedStartDate', { startDate: CompaniDate(startDate).startOf('day').toISO() });
    },
    updateSelectedEndDate (endDate) {
      this.$store.dispatch('course/setSelectedEndDate', { endDate: CompaniDate(endDate).endOf('day').toISO() });
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
      return courses
        .filter(course => (
          (course.type === INTRA && (course.companies.map(c => c._id)).includes(this.selectedCompany)) ||
          (course.type === INTER_B2B &&
              course.trainees.some(trainee => trainee.company._id === this.selectedCompany))));
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
        .filter((course) => {
          const estimatedDateIsAfter = !course.slots.length && course.estimatedStartDate &&
            CompaniDate(course.estimatedStartDate).isSameOrAfter(this.selectedStartDate);
          const someSlotsAreAfter = course.slots
            .some(slotGroup => slotGroup.some(s => CompaniDate(s.startDate).isSameOrAfter(this.selectedStartDate)));

          return estimatedDateIsAfter || someSlotsAreAfter;
        });
    },
    filterCoursesByEndDate (courses) {
      return courses
        .filter((course) => {
          const estimatedDateIsBefore = !course.slots.length && course.estimatedStartDate &&
            CompaniDate(course.estimatedStartDate).isSameOrBefore(this.selectedEndDate);
          const someSlotsAreBefore = course.slots
            .some(slotGroup => slotGroup.some(s => CompaniDate(s.endDate).isSameOrBefore(this.selectedEndDate)));

          return estimatedDateIsBefore || someSlotsAreBefore;
        });
    },
    filterCoursesByStartDateAndEndDate (courses) {
      return courses
        .filter((course) => {
          const hasEstimationInRange = !course.slots.length && course.estimatedStartDate &&
            CompaniDate(course.estimatedStartDate).isSameOrBetween(this.selectedStartDate, this.selectedEndDate);
          const hasSlotsInRange = course.slots
            .some(slotGroup => slotGroup
              .some(s => CompaniDate(s.endDate).isSameOrBetween(this.selectedStartDate, this.selectedEndDate)));

          return hasEstimationInRange || hasSlotsInRange;
        });
    },
    groupByCourses (courses) {
      return courses.map(course => ({
        ...course,
        slots: course.slots.length
          ? Object.values(groupBy(course.slots, s => CompaniDate(s.startDate).format(DD_MM_YYYY)))
          : [],
        slotsToPlan: course.slotsToPlan || [],
      }));
    },
  },
};
