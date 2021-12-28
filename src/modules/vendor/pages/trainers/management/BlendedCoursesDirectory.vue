<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="displayArchived = !displayArchived" :display-search-bar="false" />
    <div class="filters-container">
      <ni-select :options="companyFilterOptions" :model-value="selectedCompany" clearable
        @update:model-value="updateSelectedCompany" />
      <ni-select :options="programFilterOptions" :model-value="selectedProgram" clearable
        @update:model-value="updateSelectedProgram" />
      <ni-select :options="salesRepresentativesFilterOptions" clearable
        :model-value="selectedSalesRepresentative" @update:model-value="updateSelectedSalesRepresentative" />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import DirectoryHeader from '@components/DirectoryHeader';
import Trello from '@components/courses/Trello';
import Select from '@components/form/Select';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { BLENDED } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-trello': Trello,
    'ni-select': Select,
  },
  data () {
    return {
      coursesWithGroupedSlot: [],
      displayArchived: false,
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
        const courses = await Courses.list({ trainer: this.loggedUser._id, format: BLENDED });
        this.coursesWithGroupedSlot = this.groupByCourses(courses);
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
  },
  beforeUnmount () {
    if (this.$router.currentRoute.name !== 'trainers courses info') this.$store.dispatch('course/resetFilters');
  },
};
</script>
