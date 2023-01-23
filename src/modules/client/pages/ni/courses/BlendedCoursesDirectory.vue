<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="displayArchived = !displayArchived" :display-search-bar="false" />
    <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    <div class="filters-container">
      <ni-select :options="trainerFilterOptions" :model-value="selectedTrainer" clearable
        @update:model-value="updateSelectedTrainer" />
      <ni-select :options="programFilterOptions" :model-value="selectedProgram" clearable
        @update:model-value="updateSelectedProgram" />
     <ni-date-input :model-value="selectedStartDate" @update:model-value="updateSelectedStartDate"
        placeholder="Début de période" :max="selectedEndDate" :error="v$.selectedStartDate.$error"
        error-message="La date de début doit être antérieure à la date de fin" @blur="v$.selectedStartDate.$touch" />
      <ni-date-input :model-value="selectedEndDate" @update:model-value="updateSelectedEndDate"
        placeholder="Fin de période" :min="selectedStartDate" :error="v$.selectedEndDate.$error"
        error-message="La date de fin doit être postérieure à la date de début" @blur="v$.selectedEndDate.$touch" />
    </div>
    <div class="q-mb-lg filters-container">
      <div class="q-mb-lg toto">
        <q-checkbox dense :model-value="selectedNoAddressInSlots" color="primary" label="Aucune adresse"
          @update:model-value="updateSelectedNoAddressInSlots" />
      </div>
      <ni-select :options="typeFilterOptions" clearable :model-value="selectedType"
        @update:model-value="updateSelectedType" />
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { useStore } from 'vuex';
import { onBeforeRouteLeave } from 'vue-router';
import get from 'lodash/get';
import Courses from '@api/Courses';
import DateInput from '@components/form/DateInput';
import Select from '@components/form/Select';
import DirectoryHeader from '@components/DirectoryHeader';
import Trello from '@components/courses/Trello';
import { useCourseFilters } from '@composables/courseFilters';
import { BLENDED, OPERATIONS } from '@data/constants';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';

export default {
  name: 'BlendedCoursesDirectory',
  components: {
    'ni-select': Select,
    'ni-directory-header': DirectoryHeader,
    'ni-trello': Trello,
    'ni-date-input': DateInput,
  },
  setup () {
    const $store = useStore();
    const metaInfo = { title: 'Kanban formations mixtes' };
    useMeta(metaInfo);

    const coursesWithGroupedSlot = ref([]);
    const displayArchived = ref(false);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const {
      typeFilterOptions,
      selectedTrainer,
      trainerFilterOptions,
      selectedProgram,
      programFilterOptions,
      selectedStartDate,
      selectedEndDate,
      selectedType,
      selectedNoAddressInSlots,
      coursesFiltered,
      updateSelectedTrainer,
      updateSelectedProgram,
      updateSelectedStartDate,
      updateSelectedEndDate,
      updateSelectedType,
      updateSelectedNoAddressInSlots,
      resetFilters,
      groupByCourses,
    } = useCourseFilters(coursesWithGroupedSlot, displayArchived);

    const rules = computed(() => ({
      selectedStartDate: { maxDate: selectedEndDate.value ? maxDate(selectedEndDate.value) : '' },
      selectedEndDate: { minDate: selectedStartDate.value ? minDate(selectedStartDate.value) : '' },
    }));
    const v$ = useVuelidate(rules, { selectedStartDate, selectedEndDate });

    const refreshCourses = async () => {
      try {
        const courses = await Courses.list({
          company: get(loggedUser.value, 'company._id') || '',
          format: BLENDED,
          action: OPERATIONS,
        });
        coursesWithGroupedSlot.value = groupByCourses(courses);
      } catch (e) {
        console.error(e);
        coursesWithGroupedSlot.value = [];
      }
    };

    const created = async () => {
      await refreshCourses();
    };

    onBeforeRouteLeave((to) => {
      if (to.name !== 'ni courses info') resetFilters();
    });

    created();

    return {
      // Validation
      v$,
      // Data
      coursesWithGroupedSlot,
      displayArchived,
      typeFilterOptions,
      // Computed
      selectedTrainer,
      trainerFilterOptions,
      selectedProgram,
      programFilterOptions,
      selectedStartDate,
      selectedEndDate,
      selectedType,
      selectedNoAddressInSlots,
      coursesFiltered,
      // Methods
      updateSelectedTrainer,
      updateSelectedProgram,
      updateSelectedStartDate,
      updateSelectedEndDate,
      updateSelectedType,
      updateSelectedNoAddressInSlots,
      resetFilters,
    };
  },
};
</script>

<style lang="sass" scoped>

.toto
  justify-content: center
</style>
