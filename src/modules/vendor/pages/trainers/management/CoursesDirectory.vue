<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :options="companyFilterOptions" v-model="selectedCompany" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="programFilterOptions" v-model="selectedProgram" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3 reset-filters" @click="resetFilters"><span>Effacer les filtres</span></div>
    </div>
    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/courses/Trello';
import Select from '@components/form/Select';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-trello': Trello,
    'ni-select': Select,
  },
  data () {
    return {
      coursesWithGroupedSlot: [],
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    coursesFiltered () {
      let courses = this.coursesWithGroupedSlot;
      if (this.selectedProgram) courses = this.filterCoursesByProgram(courses);

      if (this.selectedTrainer) courses = this.filterCoursesByTrainer(courses);

      if (this.selectedCompany) courses = this.filterCoursesByCompany(courses);

      return courses;
    },
  },
  async created () {
    await this.refreshCourses();
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list({ trainer: this.loggedUser._id });
        this.coursesWithGroupedSlot = courses.map(course => ({
          ...course,
          slots: Object.values(groupBy(course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'))),
        }));
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
  },
}
</script>
