import { mapState } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import { DD_MM_YYYY, ON_SITE } from '@data/constants';
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
        'selectedNoAddressInSlots',
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

      if (this.selectedNoAddressInSlots) courses = this.filterCoursesByNoAddressInSlots(courses);

      return courses;
    },
    companyFilterOptions () {
      const companies = [];

      for (const course of this.coursesWithGroupedSlot) {
        const courseCompanies = course.companies.map(company => ({ label: company.name, value: company._id }));
        companies.push(...courseCompanies);
      }
      return [
        { label: 'Toutes les structures', value: '' },
        ...uniqBy(companies, 'value').sort((a, b) => a.label.localeCompare(b.label)),
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
    updateSelectedNoAddressInSlots (isSelected) {
      this.$store.dispatch('course/setSelectedNoAddressInSlots', { isSelected });
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
      return courses.filter(course => (course.companies.map(company => company._id)).includes(this.selectedCompany));
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
    filterCoursesByNoAddressInSlots (courses) {
      return courses
        .filter((course) => {
          const onSiteSlots = course.slots
            .filter(slotGroup => slotGroup.some(slot => get(slot, 'step.type') === ON_SITE));
          const hasNoAddressInOnSiteSlots = onSiteSlots.every(slotGroup => slotGroup.every(slot => !slot.address));

          return !!onSiteSlots.length && hasNoAddressInOnSiteSlots;
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
