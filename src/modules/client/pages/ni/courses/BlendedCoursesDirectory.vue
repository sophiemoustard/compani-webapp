<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="displayArchived = !displayArchived" :display-search-bar="false" />
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
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { mapState } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import DateInput from '@components/form/DateInput';
import Select from '@components/form/Select';
import DirectoryHeader from '@components/DirectoryHeader';
import Trello from '@components/courses/Trello';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { BLENDED } from '@data/constants';
import { minDate, maxDate } from '@helpers/vuelidateCustomVal';

const metaInfo = { title: 'Catalogue' };

export default {
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-select': Select,
    'ni-directory-header': DirectoryHeader,
    'ni-trello': Trello,
    'ni-date-input': DateInput,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      coursesWithGroupedSlot: [],
      displayArchived: false,
    };
  },
  validations () {
    return {
      selectedStartDate: { maxDate: this.selectedEndDate ? maxDate(this.selectedEndDate) : '' },
      selectedEndDate: { minDate: this.selectedStartDate ? minDate(this.selectedStartDate) : '' },
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
  async created () {
    await this.refreshCourses();
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list({ company: get(this.loggedUser, 'company._id') || '', format: BLENDED });
        this.coursesWithGroupedSlot = this.groupByCourses(courses);
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
  },
  beforeUnmount () {
    if (this.$route.name !== 'ni courses info') this.$store.dispatch('course/resetFilters');
  },
};
</script>
