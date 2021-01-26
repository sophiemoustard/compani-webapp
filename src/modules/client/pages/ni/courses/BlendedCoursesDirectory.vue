<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <div class="row">
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :options="trainerFilterOptions" :value="selectedTrainer" @input="updateSelectedTrainer" />
      </div>
      <div class="col-xs-12 col-sm-6 col-md-3">
        <ni-select :class="{ 'q-pl-sm': $q.platform.is.desktop }" :options="programFilterOptions"
          v-model="selectedProgram" />
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
};
</script>
