<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header :title="courseName" />
    <ni-table-list :data="learners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @go-to="goToLearnerProfile">
      <template v-slot:body="{ col }">
        <q-item v-if="col.name === 'progress'">
          <ni-progress :value="col.value" />
        </q-item>
      </template>
    </ni-table-list>
  </q-page>
</template>

<script>
import Courses from '@api/Courses';
import get from 'lodash/get';
import ProfileHeader from '@components/ProfileHeader';
import TableList from '@components/table/TableList';
import { sortStrings, formatIdentity } from '@helpers/utils';
import Progress from '@components/CourseProgress';
import { courseFollowUpMixin } from '@mixins/courseFollowUpMixin';

export default {
  name: 'ELearningCoursesProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-table-list': TableList,
    'ni-progress': Progress,
  },
  props: {
    courseId: { type: String, required: true },
  },
  mixins: [courseFollowUpMixin],
  data () {
    return {
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'identity',
          format: value => (value ? value.fullName : ''),
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'min-width: 200px; width: 70%',
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'left',
          sortable: true,
          style: 'min-width: 110px; width: 10%',
        },
      ],
      learners: [],
      pagination: { sortBy: 'identity', ascending: true, page: 1, rowsPerPage: 15 },
      courseName: '',
    };
  },
  async created () {
    await this.getLearnersList();
  },
  methods: {
    formatRow (trainee) {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        identity: { ...trainee.identity, fullName: formattedName },
        progress: this.getCourseProgress(trainee.steps),
      };
    },
    async getLearnersList () {
      try {
        this.tableLoading = true;
        const course = await Courses.getFollowUp(this.courseId);
        if (course) {
          this.courseName = get(course, 'subProgram.program.name');
          this.learners = Object.freeze(course.trainees.map(this.formatRow));
        }
      } catch (e) {
        console.error(e);
        this.learnerList = [];
      } finally {
        this.tableLoading = false;
      }
    },
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni users learners info', params: { learnerId: row._id, defaultTab: 'courses' } });
    },
  },
};
</script>
