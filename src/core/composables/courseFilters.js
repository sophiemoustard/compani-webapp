import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import sortedUniqBy from 'lodash/sortedUniqBy';
import CompaniDate from '@helpers/dates/companiDates';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { WITHOUT_TRAINER, WITHOUT_SALES_REPRESENTATIVE, INTRA, INTER_B2B } from '@data/constants';

export const useCourseFilters = (activeCourses, archivedCourses, isVendorInterface, loggedUser) => {
  const $store = useStore();

  const courses = computed(() => [...activeCourses.value, ...archivedCourses.value]);

  /* TRAINER */
  const selectedTrainer = computed(() => $store.state.course.selectedTrainer);

  const trainerFilterOptions = computed(() => {
    const filteredCourses = courses.value.filter(course => !!course.trainer);
    const trainers = formatAndSortIdentityOptions(filteredCourses, 'trainer');

    return [
      { label: 'Tous les intervenants', value: '' },
      { label: 'Sans intervenant(e)', value: WITHOUT_TRAINER },
      ...sortedUniqBy(trainers, 'value'),
    ];
  });

  const updateSelectedTrainer = trainerId => $store.dispatch('course/setSelectedTrainer', { trainerId });

  /* PROGRAM */
  const selectedProgram = computed(() => $store.state.course.selectedProgram);

  const programFilterOptions = computed(() => {
    const programs = courses.value
      .map(course => ({ label: course.subProgram.program.name, value: course.subProgram.program._id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: 'Tous les programmes', value: '' }, ...sortedUniqBy(programs, 'value')];
  });

  const updateSelectedProgram = programId => $store.dispatch('course/setSelectedProgram', { programId });

  /* COMPANY */
  const selectedCompany = computed(() => $store.state.course.selectedCompany);

  const companyFilterOptions = computed(() => {
    const companies = courses.value
      .flatMap((course) => {
        if (isVendorInterface) return course.companies.map(company => ({ label: company.name, value: company._id }));

        if (loggedUser.value.role.holding) {
          return course.companies
            .filter(company => loggedUser.value.holding.companies.includes(company._id))
            .map(company => ({ label: company.name, value: company._id }));
        }
        return [];
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: 'Toutes les structures', value: '' }, ...sortedUniqBy(companies, 'value')];
  });

  const updateSelectedCompany = companyId => $store.dispatch('course/setSelectedCompany', { companyId });

  /* SALES REPRESENTATIVE */
  const selectedSalesRepresentative = computed(() => $store.state.course.selectedSalesRepresentative);

  const salesRepresentativeFilterOptions = computed(() => {
    const filteredCourses = courses.value.filter(course => !!course.salesRepresentative);
    const salesRepresentatives = formatAndSortIdentityOptions(filteredCourses, 'salesRepresentative');

    return [
      { label: 'Tous les référents Compani', value: '' },
      { label: 'Sans référent(e) Compani', value: WITHOUT_SALES_REPRESENTATIVE },
      ...sortedUniqBy(salesRepresentatives, 'value'),
    ];
  });

  const updateSelectedSalesRepresentative = (salesRepresentativeId) => {
    $store.dispatch('course/setSelectedSalesRepresentative', { salesRepresentativeId });
  };

  /* DATES */
  const selectedStartDate = computed(() => $store.state.course.selectedStartDate);
  const selectedEndDate = computed(() => $store.state.course.selectedEndDate);

  const updateSelectedStartDate = (startDate) => {
    $store.dispatch('course/setSelectedStartDate', { startDate: CompaniDate(startDate).startOf('day').toISO() });
  };

  const updateSelectedEndDate = (endDate) => {
    $store.dispatch('course/setSelectedEndDate', { endDate: CompaniDate(endDate).endOf('day').toISO() });
  };

  /* TYPE */
  const selectedType = computed(() => $store.state.course.selectedType);

  const typeFilterOptions = ref([
    { label: 'Tous les types', value: '' },
    { label: 'Intra', value: INTRA },
    { label: 'Inter B2B', value: INTER_B2B },
  ]);

  const updateSelectedType = type => $store.dispatch('course/setSelectedType', { type });

  /* NO ADDRESS IN SLOTS */
  const selectedNoAddressInSlots = computed(() => $store.state.course.selectedNoAddressInSlots);

  const updateSelectedNoAddressInSlots = (isSelected) => {
    $store.dispatch('course/setSelectedNoAddressInSlots', { isSelected });
  };

  /* MISSING TRAINEES */
  const selectedMissingTrainees = computed(() => $store.state.course.selectedMissingTrainees);

  const updateSelectedMissingTrainees = (isSelected) => {
    $store.dispatch('course/setSelectedMissingTrainees', { isSelected });
  };

  /* ARCHIVED COURSES */
  const displayArchived = computed(() => $store.state.course.displayArchived);

  const updateDisplayArchived = (isSelected) => {
    $store.dispatch('course/setDisplayArchived', { isSelected });
  };

  const resetFilters = () => $store.dispatch('course/resetFilters');

  return {
    // data
    typeFilterOptions,
    // Computed
    selectedTrainer,
    trainerFilterOptions,
    selectedProgram,
    programFilterOptions,
    selectedCompany,
    companyFilterOptions,
    selectedSalesRepresentative,
    salesRepresentativeFilterOptions,
    selectedStartDate,
    selectedEndDate,
    selectedType,
    selectedNoAddressInSlots,
    selectedMissingTrainees,
    displayArchived,

    // Methods
    updateSelectedTrainer,
    updateSelectedProgram,
    updateSelectedCompany,
    updateSelectedSalesRepresentative,
    updateSelectedStartDate,
    updateSelectedEndDate,
    updateSelectedType,
    updateSelectedNoAddressInSlots,
    updateSelectedMissingTrainees,
    updateDisplayArchived,
    resetFilters,
  };
};
