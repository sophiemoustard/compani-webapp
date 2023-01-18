import { computed } from 'vue';
import { useStore } from 'vuex';
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import CompaniDate from '@helpers/dates/companiDates';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { DD_MM_YYYY, ON_SITE } from '@data/constants';

export const useCourseFilters = (coursesWithGroupedSlot, displayArchived) => {
  const $store = useStore();

  /* TRAINER */
  const selectedTrainer = computed(() => $store.state.course.selectedTrainer);

  const trainerFilterOptions = computed(() => {
    const filteredCourses = coursesWithGroupedSlot.value.filter(course => !!course.trainer);
    const trainers = formatAndSortIdentityOptions(filteredCourses, 'trainer');

    return [
      { label: 'Tous les intervenants', value: '' },
      { label: 'Sans intervenant(e)', value: 'without_trainer' },
      ...uniqBy(trainers, 'value'),
    ];
  });

  const updateSelectedTrainer = (trainerId) => {
    $store.dispatch('course/setSelectedTrainer', { trainerId });
  };

  const filterCoursesByTrainer = courses => courses.filter(course => (course.trainer
    ? selectedTrainer.value === course.trainer._id
    : selectedTrainer.value === 'without_trainer'));

  /* PROGRAM */
  const selectedProgram = computed(() => $store.state.course.selectedProgram);

  const programFilterOptions = computed(() => {
    const programs = coursesWithGroupedSlot.value
      .map(course => ({ label: course.subProgram.program.name, value: course.subProgram.program._id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: 'Tous les programmes', value: '' }, ...uniqBy(programs, 'value')];
  });

  const updateSelectedProgram = (programId) => {
    $store.dispatch('course/setSelectedProgram', { programId });
  };

  const filterCoursesByProgram = courses => courses
    .filter(course => course.subProgram.program._id === selectedProgram.value);

  /* COMPANY */
  const selectedCompany = computed(() => $store.state.course.selectedCompany);

  const companyFilterOptions = computed(() => {
    const companies = [];

    for (const course of coursesWithGroupedSlot.value) {
      const courseCompanies = course.companies.map(company => ({ label: company.name, value: company._id }));
      companies.push(...courseCompanies);
    }
    return [
      { label: 'Toutes les structures', value: '' },
      ...uniqBy(companies, 'value').sort((a, b) => a.label.localeCompare(b.label)),
    ];
  });

  const updateSelectedCompany = (companyId) => {
    $store.dispatch('course/setSelectedCompany', { companyId });
  };

  const filterCoursesByCompany = courses => courses
    .filter(course => (course.companies.map(company => company._id)).includes(selectedCompany.value));

  /* SALES REPRESENTATIVE */

  const selectedSalesRepresentative = computed(() => $store.state.course.selectedSalesRepresentative);

  const salesRepresentativesFilterOptions = computed(() => {
    const filteredCourses = coursesWithGroupedSlot.value.filter(course => !!course.salesRepresentative);
    const salesRepresentatives = formatAndSortIdentityOptions(filteredCourses, 'salesRepresentative');

    return [
      { label: 'Tous les référents Compani', value: '' },
      { label: 'Sans référent(e) Compani', value: 'without_sales_representative' },
      ...uniqBy(salesRepresentatives, 'value'),
    ];
  });

  const updateSelectedSalesRepresentative = (salesRepresentativeId) => {
    $store.dispatch('course/setSelectedSalesRepresentative', { salesRepresentativeId });
  };

  const filterCoursesBySalesRepresentative = courses => courses.filter(course => (course.salesRepresentative
    ? selectedSalesRepresentative.value === course.salesRepresentative._id
    : selectedSalesRepresentative.value === 'without_sales_representative'));

  /* DATES */
  const selectedStartDate = computed(() => $store.state.course.selectedStartDate);
  const selectedEndDate = computed(() => $store.state.course.selectedEndDate);

  const updateSelectedStartDate = (startDate) => {
    $store.dispatch('course/setSelectedStartDate', { startDate: CompaniDate(startDate).startOf('day').toISO() });
  };

  const updateSelectedEndDate = (endDate) => {
    $store.dispatch('course/setSelectedEndDate', { endDate: CompaniDate(endDate).endOf('day').toISO() });
  };

  const filterCoursesByStartDate = courses => courses
    .filter((course) => {
      const estimatedDateIsAfter = !course.slots.length && course.estimatedStartDate &&
          CompaniDate(course.estimatedStartDate).isSameOrAfter(selectedStartDate.value);
      const someSlotsAreAfter = course.slots
        .some(slotGroup => slotGroup.some(s => CompaniDate(s.startDate).isSameOrAfter(selectedStartDate.value)));

      return estimatedDateIsAfter || someSlotsAreAfter;
    });

  const filterCoursesByEndDate = courses => courses
    .filter((course) => {
      const estimatedDateIsBefore = !course.slots.length && course.estimatedStartDate &&
          CompaniDate(course.estimatedStartDate).isSameOrBefore(selectedEndDate.value);
      const someSlotsAreBefore = course.slots
        .some(slotGroup => slotGroup.some(s => CompaniDate(s.endDate).isSameOrBefore(selectedEndDate.value)));

      return estimatedDateIsBefore || someSlotsAreBefore;
    });

  const filterCoursesByStartDateAndEndDate = courses => courses
    .filter((course) => {
      const hasEstimationInRange = !course.slots.length && course.estimatedStartDate &&
          CompaniDate(course.estimatedStartDate).isSameOrBetween(selectedStartDate.value, selectedEndDate.value);
      const hasSlotsInRange = course.slots
        .some(slotGroup => slotGroup
          .some(s => CompaniDate(s.endDate).isSameOrBetween(selectedStartDate.value, selectedEndDate.value)));

      return hasEstimationInRange || hasSlotsInRange;
    });

  /* NO ADDRESS IN SLOTS */
  const selectedNoAddressInSlots = computed(() => $store.state.course.selectedNoAddressInSlots);

  const updateSelectedNoAddressInSlots = (isSelected) => {
    $store.dispatch('course/setSelectedNoAddressInSlots', { isSelected });
  };

  const filterCoursesByNoAddressInSlots = courses => courses
    .filter((course) => {
      const onSiteSlots = course.slots
        .filter(slotGroup => slotGroup.some(slot => get(slot, 'step.type') === ON_SITE));
      const hasNoAddressInOnSiteSlots = onSiteSlots.every(slotGroup => slotGroup.every(slot => !slot.address));

      return !!onSiteSlots.length && hasNoAddressInOnSiteSlots;
    });

  /* MAIN */
  const filterArchivedCourses = courses => courses.filter(course => !course.archivedAt);

  const coursesFiltered = computed(() => {
    let courses = coursesWithGroupedSlot.value;
    if (selectedProgram.value) courses = filterCoursesByProgram(courses);

    if (selectedTrainer.value) courses = filterCoursesByTrainer(courses);

    if (selectedCompany.value) courses = filterCoursesByCompany(courses);

    if (selectedSalesRepresentative.value) courses = filterCoursesBySalesRepresentative(courses);

    if (!displayArchived.value) courses = filterArchivedCourses(courses);

    if (selectedStartDate.value && !selectedEndDate.value) courses = filterCoursesByStartDate(courses);

    if (selectedEndDate.value && !selectedStartDate.value) courses = filterCoursesByEndDate(courses);

    if (selectedEndDate.value && selectedStartDate.value) courses = filterCoursesByStartDateAndEndDate(courses);

    if (selectedNoAddressInSlots.value) courses = filterCoursesByNoAddressInSlots(courses);

    return courses;
  });

  const resetFilters = () => {
    $store.dispatch('course/resetFilters');
  };

  const groupByCourses = courses => courses.map(course => ({
    ...course,
    slots: course.slots.length
      ? Object.values(groupBy(course.slots, s => CompaniDate(s.startDate).format(DD_MM_YYYY)))
      : [],
    slotsToPlan: course.slotsToPlan || [],
  }));

  return {
    // Computed
    selectedTrainer,
    trainerFilterOptions,
    selectedProgram,
    programFilterOptions,
    selectedCompany,
    companyFilterOptions,
    selectedSalesRepresentative,
    salesRepresentativesFilterOptions,
    selectedStartDate,
    selectedEndDate,
    selectedNoAddressInSlots,
    coursesFiltered,

    // Methods
    updateSelectedTrainer,
    updateSelectedProgram,
    updateSelectedCompany,
    updateSelectedSalesRepresentative,
    updateSelectedStartDate,
    updateSelectedEndDate,
    updateSelectedNoAddressInSlots,
    resetFilters,
    groupByCourses,
  };
};
