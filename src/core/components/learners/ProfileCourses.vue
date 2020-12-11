<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Formations suivies</p>
    <q-card>
      <q-table :data="courses" :columns="columns" @go-to="goToBlendedCourseProfileAdmin" hide-bottom class="q-pa-md">
        <template #header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th v-for="col in props.cols" :key="col.name" :props="props"> {{ col.label }} </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" @click="props.expand = !props.expand" class="cursor-pointer">
            <q-td auto-width />
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'progress'">
                <ni-progress class="q-ml-lg" :value="col.value" />
              </template>
              <template v-else-if="col.name === 'expand'">
                <q-icon :name="props.expand ? 'expand_less' : 'expand_more'" />
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td auto-width />
            <q-td colspan="100%">
              <div v-for="(step, stepIndex) in props.row.subProgram.steps" :key="step._id" :props="props"
                class="q-ma-sm step">
                <div>
                  <q-icon :name="step.type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach'" />
                  {{ stepIndex + 1 }} - {{ step.name }}
                </div>
                <ni-progress class="sub-progress" :value="step.progress" />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
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

export default {
  name: 'ProfileCourses',
  components: {
    'ni-progress': Progress,
  },
  data () {
    return {
      isVendorInterface: /\/ad\//.test(this.$router.currentRoute.path),
      courses: [],
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
      this.courses = await Courses.listUserCourse({ traineeId: this.userProfile._id });
    } catch (e) {
      console.error(e);
      this.courses = [];
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
  width: 16%
</style>
