<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="updateDisplayArchived" :display-search-bar="false" />
    <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    <div class="filters-container">
      <ni-select :options="companyFilterOptions" :model-value="selectedCompany" clearable
        @update:model-value="updateSelectedCompany" />
      <ni-select :options="trainerFilterOptions" :model-value="selectedTrainer" clearable
        @update:model-value="updateSelectedTrainer" />
      <ni-select :options="programFilterOptions" :model-value="selectedProgram" clearable
        @update:model-value="updateSelectedProgram" />
      <ni-select :options="salesRepresentativeFilterOptions" :model-value="selectedSalesRepresentative" clearable
        @update:model-value="updateSelectedSalesRepresentative" />
      <ni-date-input :model-value="selectedStartDate" @update:model-value="updateSelectedStartDate"
        placeholder="Début de période" :max="selectedEndDate" :error="v$.selectedStartDate.$error"
        error-message="La date de début doit être antérieure à la date de fin" @blur="v$.selectedStartDate.$touch" />
      <ni-date-input :model-value="selectedEndDate" @update:model-value="updateSelectedEndDate"
        placeholder="Fin de période" :min="selectedStartDate" :error="v$.selectedEndDate.$error"
        error-message="La date de fin doit être postérieure à la date de début" @blur="v$.selectedEndDate.$touch" />
      <ni-select :options="typeFilterOptions" clearable :model-value="selectedType"
        @update:model-value="updateSelectedType" />
    </div>
    <div class="q-mb-lg filters-container checkboxes">
      <q-checkbox dense :model-value="selectedNoAddressInSlots" color="primary" label="Aucune adresse"
        @update:model-value="updateSelectedNoAddressInSlots" />
      <q-checkbox dense :model-value="selectedMissingTrainees" color="primary" label="Apprenant(s) manquant(s) (INTRA)"
        @update:model-value="updateSelectedMissingTrainees" />
    </div>
    <ni-trello :courses="coursesWithGroupedSlot" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="openCourseCreationModal" />

    <course-creation-modal v-model="courseCreationModal" v-model:new-course="newCourse" :is-intra-course="isIntraCourse"
      :programs="programs" :company-options="companyOptions" :validations="v$.newCourse" :loading="modalLoading"
      @hide="resetCreationModal" @submit="createCourse" :sales-representative-options="salesRepresentativeOptions" />
  </q-page>
</template>

<script>
import { computed, ref } from 'vue';
import { useMeta } from 'quasar';
import { useStore } from 'vuex';
import { onBeforeRouteLeave } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import Users from '@api/Users';
import DirectoryHeader from '@components/DirectoryHeader';
import DateInput from '@components/form/DateInput';
import Select from '@components/form/Select';
import CourseCreationModal from 'src/modules/vendor/components/courses/CourseCreationModal';
import Trello from '@components/courses/Trello';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { useCourseFilters } from '@composables/courseFilters';
import { INTRA, BLENDED, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN, OPERATIONS } from '@data/constants';
import { formatAndSortOptions, formatAndSortIdentityOptions } from '@helpers/utils';
import { minDate, maxDate, strictPositiveNumber, integerNumber, positiveNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'BlendedCoursesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-select': Select,
    'course-creation-modal': CourseCreationModal,
    'ni-trello': Trello,
    'ni-date-input': DateInput,
  },
  setup () {
    const $store = useStore();
    const metaInfo = { title: 'Kanban formations mixtes' };
    useMeta(metaInfo);

    /* COURSE CREATION */
    const courseCreationModal = ref(false);
    const modalLoading = ref(false);
    const newCourse = ref({
      program: '',
      subProgram: '',
      company: '',
      misc: '',
      type: INTRA,
      salesRepresentative: '',
      estimatedStartDate: '',
      maxTrainees: '8',
      expectedBillsCount: '0',
    });
    const companyOptions = ref([]);
    const programs = ref([]);
    const salesRepresentativeOptions = ref([]);

    const isIntraCourse = computed(() => newCourse.value.type === INTRA);
    const loggedUser = computed(() => $store.state.main.loggedUser);

    const refreshPrograms = async () => {
      try {
        programs.value = await Programs.list();
      } catch (e) {
        console.error(e);
        programs.value = [];
      }
    };

    const refreshCompanies = async () => {
      try {
        const companies = await Companies.list();
        companyOptions.value = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        companyOptions.value = [];
      }
    };

    const refreshSalesRepresentatives = async () => {
      try {
        const salesRepresentatives = await Users.list({ role: [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        salesRepresentativeOptions.value = formatAndSortIdentityOptions(salesRepresentatives);
      } catch (e) {
        console.error(e);
        salesRepresentativeOptions.value = [];
      }
    };

    const openCourseCreationModal = () => {
      newCourse.value = { ...newCourse.value, salesRepresentative: loggedUser.value._id };
      courseCreationModal.value = true;
    };

    const resetCreationModal = () => {
      v$.value.newCourse.$reset();
      newCourse.value = {
        program: '',
        company: '',
        misc: '',
        type: INTRA,
        salesRepresentative: '',
        estimatedStartDate: '',
        maxTrainees: '8',
        expectedBillsCount: '0',
      };
    };

    const createCourse = async () => {
      try {
        v$.value.newCourse.$touch();
        if (v$.value.newCourse.$error) return NotifyWarning('Champ(s) invalide(s)');

        modalLoading.value = true;
        await Courses.create(pickBy(omit(newCourse.value, 'program')));

        courseCreationModal.value = false;
        NotifyPositive('Formation créée.');
        await refreshCourses();
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de créer la formation.');
      } finally {
        modalLoading.value = false;
      }
    };

    /* FILTERS */
    const coursesWithGroupedSlot = ref([]);

    const {
      typeFilterOptions,
      selectedCompany,
      companyFilterOptions,
      selectedTrainer,
      trainerFilterOptions,
      selectedProgram,
      programFilterOptions,
      selectedSalesRepresentative,
      salesRepresentativeFilterOptions,
      selectedStartDate,
      selectedEndDate,
      selectedType,
      selectedNoAddressInSlots,
      selectedMissingTrainees,
      displayArchived,
      coursesFiltered,
      updateSelectedCompany,
      updateSelectedTrainer,
      updateSelectedProgram,
      updateSelectedSalesRepresentative,
      updateSelectedStartDate,
      updateSelectedEndDate,
      updateSelectedType,
      updateSelectedNoAddressInSlots,
      updateSelectedMissingTrainees,
      updateDisplayArchived,
      resetFilters,
      groupByCourses,
    } = useCourseFilters(coursesWithGroupedSlot);

    const refreshCourses = async () => {
      try {
        const courses = await Courses.list({ format: BLENDED, action: OPERATIONS });
        coursesWithGroupedSlot.value = groupByCourses(courses);
      } catch (e) {
        console.error(e);
        coursesWithGroupedSlot.value = [];
      }
    };

    onBeforeRouteLeave((to) => {
      if (to.name !== 'ni management blended courses info') resetFilters();
    });

    /* MAIN */
    const rules = computed(() => ({
      newCourse: {
        program: { required },
        subProgram: { required },
        type: { required },
        salesRepresentative: { required },
        ...(isIntraCourse.value &&
          {
            maxTrainees: { required, strictPositiveNumber, integerNumber },
            expectedBillsCount: { required, positiveNumber, integerNumber },
          }),
        company: { required: requiredIf(isIntraCourse.value) },
      },
      selectedStartDate: { maxDate: selectedEndDate.value ? maxDate(selectedEndDate.value) : '' },
      selectedEndDate: { minDate: selectedStartDate.value ? minDate(selectedStartDate.value) : '' },
    }));
    const v$ = useVuelidate(rules, { newCourse, selectedStartDate, selectedEndDate });

    const created = async () => {
      await Promise.all([
        refreshCourses(),
        refreshPrograms(),
        refreshCompanies(),
        refreshSalesRepresentatives(),
      ]);
    };

    created();

    return {
      // Validation
      v$,
      // Data
      courseCreationModal,
      modalLoading,
      newCourse,
      companyOptions,
      programs,
      salesRepresentativeOptions,
      coursesWithGroupedSlot,
      displayArchived,
      typeFilterOptions,
      // Computed
      isIntraCourse,
      selectedCompany,
      companyFilterOptions,
      selectedTrainer,
      trainerFilterOptions,
      selectedProgram,
      programFilterOptions,
      selectedSalesRepresentative,
      salesRepresentativeFilterOptions,
      selectedStartDate,
      selectedEndDate,
      selectedType,
      selectedNoAddressInSlots,
      selectedMissingTrainees,
      coursesFiltered,
      // Methods
      openCourseCreationModal,
      resetCreationModal,
      createCourse,
      updateSelectedCompany,
      updateSelectedTrainer,
      updateSelectedProgram,
      updateSelectedSalesRepresentative,
      updateSelectedStartDate,
      updateSelectedEndDate,
      updateSelectedType,
      updateSelectedNoAddressInSlots,
      updateSelectedMissingTrainees,
      updateDisplayArchived,
      resetFilters,
    };
  },
};
</script>

<style lang="sass" scoped>
.checkboxes
  grid-gap: 12px 10px
</style>
