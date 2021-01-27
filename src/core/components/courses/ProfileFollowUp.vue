<template>
  <div>
    <p class="text-weight-bold">Progression des participants</p>
    <q-card>
      <ni-expanding-table :data="learners" :columns="columns" :pagination="pagination" :hide-bottom="false">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'progress'">
              <ni-progress class="progress" :value="col.value" />
            </template>
            <template v-else-if="col.name === 'expand'">
              <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
            </template>
            <template v-else>
              <div class="name" @click.stop="goToLearnerProfile(props.row)">{{ col.value }}</div>
            </template>
          </q-td>
        </template>
        <template #expanding-row="{ props }">
          <q-td colspan="100%">
            <div v-for="(step, stepIndex) in props.row.steps" :key="step._id" :props="props"
              class="q-ma-sm expanding-table-expanded-row">
              <div>
                <q-icon :name="step.type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach'" />
                {{ stepIndex + 1 }} - {{ step.name }}
              </div>
              <div class="expanding-table-progress-container">
                <ni-progress class="expanding-table-sub-progress" :value="step.progress" />
              </div>
            </div>
          </q-td>
        </template>
      </ni-expanding-table>
    </q-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Courses from '@api/Courses';
import ExpandingTable from '@components/table/ExpandingTable';
import Progress from '@components/CourseProgress';
import { NotifyNegative } from '@components/popup/notify';
import { sortStrings, formatIdentity } from '@helpers/utils';
import { E_LEARNING } from '@data/constants.js';

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
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      course: {},
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
          style: 'width: 70%',
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'center',
          sortable: true,
          style: 'min-width: 150px; width: 20%',
        },
        { name: 'expand', label: '', field: '' },
      ],
      learners: [],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      E_LEARNING,
      isClientInterface,
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  async created () {
    await this.getLearnersList();
  },
  methods: {
    goToLearnerProfile (row) {
      const name = this.isClientInterface ? 'ni courses learners info' : 'ni users learners info';
      this.$router.push({ name, params: { learnerId: row._id, defaultTab: 'courses' } });
    },
    formatRow (trainee) {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        _id: trainee._id,
        identity: { ...trainee.identity, fullName: formattedName },
        progress: trainee.progress,
        steps: trainee.steps,
      };
    },
    async getLearnersList () {
      try {
        this.tableLoading = true;
        const course = await Courses.getFollowUp(
          this.profileId,
          this.isClientInterface ? { company: this.company._id } : null
        );

        if (course) this.learners = Object.freeze(course.trainees.map(this.formatRow));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des apprenants');
        this.learners = [];
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .progress
    width: 100%
  .name
    width: fit-content;
    text-decoration: underline
    color: $primary
</style>
