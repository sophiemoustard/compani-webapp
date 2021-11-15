<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl">
      <template slot="title">
       <q-toggle dense :value="displayArchived" color="primary" label="Archivées"
          @input="displayArchived=!displayArchived" class="q-ml-sm q-mb-sm" />
      </template>
    </ni-title-header>
    <div class="filters-container">
      <ni-select :options="companyFilterOptions" :value="selectedCompany" @input="updateSelectedCompany" />
      <ni-select :options="programFilterOptions" :value="selectedProgram" @input="updateSelectedProgram" />
      <ni-select :options="salesRepresentativesFilterOptions"
        :value="selectedSalesRepresentative" @input="updateSelectedSalesRepresentative" />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/courses/Trello';
import Select from '@components/form/Select';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { BLENDED } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-title-header': TitleHeader,
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
  beforeDestroy () {
    if (this.$router.currentRoute.name !== 'trainers courses info') this.$store.dispatch('course/resetFilters');
  },
};
</script>
