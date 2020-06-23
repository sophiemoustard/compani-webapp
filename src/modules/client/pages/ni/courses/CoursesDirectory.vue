<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :options="trainerFilterOptions" v-model="selectedTrainer" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="programFilterOptions"
          v-model="selectedProgram" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3 reset-filters" @click="resetFilters"><span>Effacer les filtres</span></div>
    </div>

    <ni-trello :courses="coursesFiltered" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import Courses from '@api/Courses';
import Select from '@components/form/Select';
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/courses/Trello';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  mixins: [courseFiltersMixin],
  components: {
    'ni-select': Select,
    'ni-title-header': TitleHeader,
    'ni-trello': Trello,
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

      return courses;
    },
  },
  async created () {
    await this.refreshCourses();
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list({ company: get(this.loggedUser, 'company._id') || '' });
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
