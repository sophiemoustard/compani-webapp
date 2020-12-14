<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Formations suivies</p>
    <q-card>
      <ni-expanding-table :data="courses" :columns="columns" :loading="loading">
        <template #row="{ props }">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'progress'">
              <ni-progress class="q-ml-lg" :value="col.value" />
            </template>
            <template v-else-if="col.name === 'expand'">
              <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </template>
        <template #expanding-row="{ props }">
          <q-td colspan="100%">
            <div v-for="(step, stepIndex) in props.row.subProgram.steps" :key="step._id" :props="props"
              class="q-ma-sm step">
              <div>
                <q-icon :name="step.type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach'" />
                {{ stepIndex + 1 }} - {{ step.name }}
              </div>
              <div class="progress-container">
                <ni-progress class="sub-progress" :value="step.progress" />
              </div>
            </div>
          </q-td>
        </template>
      </ni-expanding-table>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import { BLENDED, E_LEARNING } from '@data/constants';
import { sortStrings } from '@helpers/utils';
import Progress from '@components/CourseProgress';
import { NotifyNegative } from '@components/popup/notify';
import ExpandingTable from '@components/table/ExpandingTable';

export default {
  name: 'ProfileCourses',
  components: {
    'ni-progress': Progress,
    'ni-expanding-table': ExpandingTable,
  },
  data () {
    return {
      isVendorInterface: /\/ad\//.test(this.$router.currentRoute.path),
      courses: [],
      loading: false,
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row,
          align: 'left',
          sortable: true,
          format: value => (get(value, 'subProgram.program.name') || '') + (value.misc ? ` - ${value.misc}` : ''),
          sort: (a, b) => sortStrings(get(a, 'subProgram.program.name') || '', get(b, 'subProgram.program.name') || ''),
          style: 'width: 30%',
        },
        {
          name: 'type',
          label: 'Type de formation',
          field: 'format',
          align: 'left',
          sortable: true,
          format: value => ((value === BLENDED) ? 'Mixte' : 'ELearning'),
          sort: (a, b) => sortStrings(a, b),
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'center',
          sortable: true,
          style: 'min-width: 150px; width: 20%',
        },
        { name: 'expand', label: '', field: '_id' },
      ],
      E_LEARNING,
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
  },
  async created () {
    try {
      this.loading = true;
      this.courses = await Courses.listUserCourse({ traineeId: this.userProfile._id });
    } catch (e) {
      NotifyNegative('Erreur lors de la récupération des formations');
      console.error(e);
      this.courses = [];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goToBlendedCourseProfileAdmin (row) {
      if (!this.isVendorInterface) return;
      this.$router.push({
        name: 'ni management blended courses info',
        params: { courseId: row._id, defaultTab: 'admin' },
      });
    },
  },
};
</script>
<style lang="stylus" scoped>
.step
  display: flex
  justify-content: space-between
.sub-progress
  min-width: 100px
  width: 10%
.progress-container
  max-width: 230px
  width: 25%
</style>
