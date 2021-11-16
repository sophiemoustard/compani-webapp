<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Formations" toggle-label="Archivées" :toggle-value="displayArchived"
      display-toggle @toggle="displayArchived=!displayArchived" :display-search-bar="false" />
    <div class="filters-container">
      <ni-select :options="trainerFilterOptions" :value="selectedTrainer" @input="updateSelectedTrainer" />
      <ni-select :options="programFilterOptions" :value="selectedProgram" @input="updateSelectedProgram" />
      <div class="reset-filters" @click="resetFilters">Effacer les filtres</div>
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import Select from '@components/form/Select';
import DirectoryHeader from '@components/DirectoryHeader';
import Trello from '@components/courses/Trello';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { BLENDED } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-select': Select,
    'ni-directory-header': DirectoryHeader,
    'ni-trello': Trello,
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
        const courses = await Courses.list({ company: get(this.loggedUser, 'company._id') || '', format: BLENDED });
        this.coursesWithGroupedSlot = this.groupByCourses(courses);
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
  },
  beforeDestroy () {
    if (this.$router.currentRoute.name !== 'ni courses info') this.$store.dispatch('course/resetFilters');
  },
};
</script>
