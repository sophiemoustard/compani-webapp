<template>
  <div>
    <p class="text-weight-bold q-mb-none">Participants</p>
    <q-card>
      <ni-expanding-table :data="learners" :columns="columns" :pagination="pagination">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'progress'">
              <ni-progress class="q-ml-lg" :value="col.value" />
            </template>
            <template v-else-if="col.name === 'expand'">
              <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
            </template>
            <template v-else>
              <div class="name" @click="goToLearnerProfile(props.row)">{{ col.value }}</div>
            </template>
          </q-td>
        </template>
      </ni-expanding-table>
    </q-card>
  </div>
</template>

<script>
import Courses from '@api/Courses';
import ExpandingTable from '@components/table/ExpandingTable';
import { sortStrings, formatIdentity } from '@helpers/utils';
import Progress from '@components/CourseProgress';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-expanding-table': ExpandingTable,
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
        { name: 'expand', label: '', field: '_id' },
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
.name
  width: fit-content;
</style>
