<template>
  <div>
    <p class="text-weight-bold q-mb-none">Participants</p>
    <ni-table-list :data="learners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @go-to="goToLearnerProfile">
      <template #body="{ col }">
        <q-item v-if="col.name === 'progress'">
          <ni-progress class="progress" :value="col.value" />
        </q-item>
      </template>
    </ni-table-list>
  </div>
</template>

<script>
import Courses from '@api/Courses';
import TableList from '@components/table/TableList';
import { sortStrings, formatIdentity } from '@helpers/utils';
import Progress from '@components/CourseProgress';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-table-list': TableList,
    'ni-progress': Progress,
  },
  props: {
    profileId: { type: String, required: true },
  },
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
          style: 'min-width: 200px; width: 80%',
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'left',
          sortable: true,
        },
      ],
      learners: [],
      pagination: { sortBy: 'identity', ascending: true, page: 1, rowsPerPage: 15 },
    };
  },
  async created () {
    await this.getLearnersList();
  },
  methods: {
    formatRow (trainee) {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        _id: trainee._id,
        identity: { ...trainee.identity, fullName: formattedName },
        progress: trainee.progress,
      };
    },
    async getLearnersList () {
      try {
        this.tableLoading = true;
        const course = await Courses.getFollowUp(this.profileId);

        if (course) this.learners = Object.freeze(course.trainees.map(this.formatRow));
      } catch (e) {
        console.error(e);
        this.learners = [];
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
<style lang="stylus" scoped>
.progress
  width: 100%
</style>
