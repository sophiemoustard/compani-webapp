<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Utilisation du eLearning</p>
      <div class="row justify-between">
        <div class="col-md-6 col-xs-12 global-view-container">
          <q-card flat class="q-pa-md right-stats global-view column">
            <div class="text-weight-bold">Vue globale</div>
            <div class="self-center justify-center column learners-data">
              <div class="row items-center">
                <ni-e-learning-indicator :indicator="eLearningCoursesOnGoing.length" class="q-pr-sm" />
                <div>{{ eLearningCoursesOnGoingText }}</div>
              </div>
              <div class="row items-center">
                <ni-e-learning-indicator :indicator="eLearningCoursesCompleted.length" class="q-pr-sm" />
                <div>{{ eLearningCoursesCompletedText }}</div>
              </div>
              <div class="row items-center">
                <ni-e-learning-indicator :indicator="eLearningActivitiesCompleted.length" class="q-pr-sm" />
                <div>{{ eLearningActivitesCompletedText }}</div>
              </div>
            </div>
          </q-card>
        </div>
        <ni-line-chart title="Nombre total d'activités réalisées par mois"
          :chart-data="chartData(this.activitiesByMonth)" class="col-md-6 col-xs-12 line-chart-container" />
      </div>
    </div>
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
              <template v-else-if="col.name === 'name'">
                <div @click.stop="goToCourseProfile(props)" class="name">{{ col.value }}</div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </template>
          <template #expanding-row="{ props }">
            <q-td colspan="100%">
              <div v-for="(step, stepIndex) in props.row.subProgram.steps" :key="step._id" :props="props"
                class="q-ma-sm expanding-table-expanded-row">
                <div>
                  <q-icon :name="getStepTypeIcon(step.type)" />
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import Courses from '@api/Courses';
import { BLENDED, E_LEARNING, STRICTLY_E_LEARNING } from '@data/constants';
import { sortStrings } from '@helpers/utils';
import { isBetween } from '@helpers/date';
import LineChart from '@components/charts/LineChart';
import Progress from '@components/CourseProgress';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import ExpandingTable from '@components/table/ExpandingTable';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import { chartMixin } from '@mixins/chartMixin';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileCourses',
  mixins: [chartMixin, courseMixin],
  components: {
    'ni-progress': Progress,
    'ni-expanding-table': ExpandingTable,
    'ni-e-learning-indicator': ELearningIndicator,
    'ni-line-chart': LineChart,
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
          sort: sortStrings,
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
    eLearningCourses () {
      return this.courses.filter(course => course.format === STRICTLY_E_LEARNING) || [];
    },
    eLearningCoursesOnGoing () {
      return this.eLearningCourses.filter(course => course.progress < 1) || [];
    },
    eLearningCoursesOnGoingText () {
      const formation = this.eLearningCoursesOnGoing.length > 1 ? 'formations' : 'formation';
      return `${formation} eLearning en cours`;
    },
    eLearningCoursesCompleted () {
      return this.eLearningCourses.filter(course => course.progress === 1) || [];
    },
    eLearningCoursesCompletedText () {
      return this.eLearningCoursesCompleted.length > 1
        ? 'formations eLearning terminées'
        : 'formation eLearning terminée';
    },
    eLearningActivitiesCompleted () {
      const activityHistories = this.courses
        .map(c => c.subProgram.steps.map(s => s.activities.map(a => a.activityHistories).flat()).flat())
        .flat();

      return uniqBy(activityHistories, '_id');
    },
    eLearningActivitesCompletedText () {
      return this.eLearningActivitiesCompleted.length > 1
        ? 'activités eLearning réalisées'
        : 'activité eLearning réalisée';
    },

  },
  async created () {
    try {
      this.loading = true;
      this.courses = await Courses.listUserCourse({ traineeId: this.userProfile._id });
      await this.computeChartsData();
    } catch (e) {
      NotifyNegative('Erreur lors de la récupération des formations');
      console.error(e);
      this.courses = [];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goToCourseProfile (props) {
      if (!this.isVendorInterface && props.row.subProgram.isStrictlyELearning) {
        return this.$router.push({ name: 'ni elearning courses info', params: { courseId: props.row._id } });
      }

      if (!this.isVendorInterface) {
        return this.$router.push({ name: 'ni courses info', params: { courseId: props.row._id } });
      }

      if (props.row.subProgram.isStrictlyELearning) {
        return this.$router.push({ name: 'ni management elearning courses info', params: { courseId: props.row._id } });
      }

      this.$router.push({
        name: 'ni management blended courses info',
        params: { courseId: props.row._id, defaultTab: 'traineeFollowUp' },
      });
    },
    async computeChartsData () {
      try {
        const chartStartDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
        const chartEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const sixMonthsHistories = this.eLearningActivitiesCompleted
          .filter(ah => isBetween(ah.createdAt, chartStartDate, chartEndDate));

        this.activitiesByMonth = this.getDataByMonth(sixMonthsHistories);
        NotifyPositive('Données mises à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des données.');
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.name
  width: fit-content
  text-decoration: underline
  color: $primary

.right-stats
  margin-right: 8px
  @media screen and (max-width: 599px)
    margin-right: 0px
    margin-bottom: 8px

.global-view
  height: 100%
  &-container
    @media screen and (min-width: $breakpoint-sm-max)
      padding-right: 16px
.line-chart-container
  @media screen and (max-width: $breakpoint-sm-max)
    margin-top: 16px

.learners-data
  flex: 1
</style>
