<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl">
      <template slot="title">
        <q-toggle dense :value="displayArchived" color="primary" label="Archivées"
          @input="displayArchived=!displayArchived" class="q-ml-sm q-mb-sm" />
      </template>
    </ni-title-header>
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
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/courses/Trello';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { BLENDED } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'BlendedCoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-select': Select,
    'ni-title-header': TitleHeader,
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
