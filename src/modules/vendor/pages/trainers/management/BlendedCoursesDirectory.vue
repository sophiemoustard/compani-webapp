<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :options="companyFilterOptions" :value="selectedCompany" @input="updateSelectedCompany" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="programFilterOptions"
          :value="selectedProgram" @input="updateSelectedProgram" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3 reset-filters" @click="resetFilters">
        <span>Effacer les filtres</span>
      </div>
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
