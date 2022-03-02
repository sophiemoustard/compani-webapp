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
        <ni-line-chart :data="this.activitiesByMonth" :labels="months" class="col-md-6 col-xs-12 line-chart-container"
          title="Nombre total d'activités réalisées par mois" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Formations suivies</p>
      <q-card>
        <ni-expanding-table :data="courses" :columns="courseColumns" :loading="loading" v-model:pagination="pagination">
          <template #row="{ props }">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'attendances' && has(col, 'value.attendanceDuration')">
                <div>
                  {{ formatDuration(get(col, 'value.attendanceDuration')) }}
                  / {{ formatDuration(get(col, 'value.maxDuration')) }}
                  </div>
              </template>
              <template v-else-if="col.name === 'eLearning' && col.value >= 0">
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
              <div v-if="props.row.subProgram.liveSteps.length"
                class="text-weight-bold q-mb-sm">
                Présences
              </div>
              <div v-for="step in props.row.subProgram.liveSteps" :key="step._id"
                :props="props" class="q-mb-xs">
                <div v-for="slot in step.slots" :key="slot._id" class="q-ml-md row">
                  <q-icon :name="getStepTypeIcon(step.type)" />
                  <div class="col-6">{{ step.name }}</div>
                  <div class="dates col-2">{{ formatDate(slot.startDate) }}</div>
                  <div class="hours  col-2">{{ formatIntervalHourly(slot) }} ({{ getDuration(slot) }})</div>
                  <div v-if="slot.attendances.length" class="attendance">
                    <q-icon size="12px" name="check_circle" color="green-600" />
                    <span class="text-green-600">Présent(e)</span>
                  </div>
                  <div v-else-if="isBefore(new Date(), slot.endDate)" class="attendance">
                    <span class="q-mx-sm text-italic text-copper-grey-800">à venir</span>
                  </div>
                  <div v-else class="attendance">
                    <q-icon size="12px" name="fas fa-times-circle" color="orange-700" />
                    <span class="text-orange-700">Absent(e)</span>
                  </div>
                </div>
              </div>
              <div v-if="props.row.subProgram.elearningSteps.length" class="text-weight-bold q-my-sm">
                Complétion eLearning
              </div>
              <div v-for="step in props.row.subProgram.elearningSteps" :key="step._id"
                :props="props" class="q-mb-xs q-ml-md row">
                <q-icon name="stay_current_portrait" />
                <div class="col-9">{{ step.name }}</div>
                <ni-progress class="expanding-table-sub-progress" :value="step.progress.eLearning" />
              </div>
            </q-td>
          </template>
        </ni-expanding-table>
      </q-card>
    </div>
    <div v-if="unsubscribedAttendances.length" class="q-mb-xl">
      <p class="text-weight-bold q-mb-sm">Emargements non prévus</p>
      <div class="text-italic q-my-xs">
        {{ formatIdentity(userProfile.identity, 'FL') }} a émargé dans certaines formations sans inscription.
      </div>
      <ni-expanding-table :data="unsubscribedAttendances" :columns="attendanceColumns" :pagination="pagination"
        :hide-bottom="false" :loading="loading">
        <template #expanding-row="{ props }">
          <q-td colspan="100%">
            <div v-for="attendance in props.row.attendances" :key="attendance._id" :props="props"
              class="q-ma-sm expanding-table-expanded-row">
              <div class="dates">{{ attendance.date }}</div>
              <div class="hours">{{ attendance.hours }}</div>
              <div class="misc">{{ attendance.misc }}</div>
              <div class="trainer">{{ attendance.trainer }}</div>
            </div>
          </q-td>
        </template>
      </ni-expanding-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import has from 'lodash/has';
import uniqBy from 'lodash/uniqBy';
import Courses from '@api/Courses';
import Attendances from '@api/Attendances';
import { BLENDED, E_LEARNING, STRICTLY_E_LEARNING, ON_SITE, REMOTE } from '@data/constants';
import { sortStrings, formatIdentity } from '@helpers/utils';
import {
  isBetween,
  formatDate,
  ascendingSort,
  getTotalDuration,
  getDuration,
  formatIntervalHourly,
  isBefore,
} from '@helpers/date';
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
      isVendorInterface: /\/ad\//.test(this.$route.path),
      courses: [],
      loading: false,
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      courseColumns: [
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
        { name: 'attendances', label: 'Emargements', field: row => get(row, 'progress.presence'), align: 'center' },
        {
          name: 'eLearning',
          label: 'eLearning',
          field: row => get(row, 'progress.eLearning'),
          align: 'center',
          sortable: true,
          style: 'min-width: 150px; width: 20%',
        },
        { name: 'expand', label: '', field: '_id' },
      ],
      attendanceColumns: [
        { name: 'name', label: 'Nom', field: 'program', align: 'left' },
        { name: 'unexpectedAttendances', label: 'Emargements imprévus', field: 'attendancesCount', align: 'center' },
        { name: 'duration', label: 'Durée', field: 'duration', align: 'center' },
        { name: 'expand', label: '', field: '' },
      ],
      E_LEARNING,
      unsubscribedAttendances: [],
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    eLearningCourses () {
      return this.courses.filter(course => course.format === STRICTLY_E_LEARNING) || [];
    },
    eLearningCoursesOnGoing () {
      return this.eLearningCourses.filter(course => course.progress.eLearning < 1) || [];
    },
    eLearningCoursesOnGoingText () {
      const formation = this.eLearningCoursesOnGoing.length > 1 ? 'formations' : 'formation';
      return `${formation} eLearning en cours`;
    },
    eLearningCoursesCompleted () {
      return this.eLearningCourses.filter(course => course.progress.eLearning === 1) || [];
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
    await this.getUserCourses();
    this.computeChartsData();
    this.getUnsubscribedAttendances();
  },
  methods: {
    formatIdentity,
    get,
    has,
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
    async getUserCourses () {
      try {
        this.loading = true;
        const userCourses = await Courses.listUserCourse({ traineeId: this.userProfile._id });

        this.courses = userCourses.map(course => ({
          ...course,
          subProgram: {
            ...course.subProgram,
            elearningSteps: course.subProgram.steps.filter(step => step.type === E_LEARNING),
            liveSteps: course.subProgram.steps.filter(step => [ON_SITE, REMOTE].includes(step.type)),
          },
        }));
      } catch (e) {
        NotifyNegative('Erreur lors de la récupération des formations');
        console.error(e);
        this.courses = [];
      } finally {
        this.loading = false;
      }
    },
    async computeChartsData () {
      try {
        this.loading = true;
        const chartStartDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
        const chartEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const sixMonthsHistories = this.eLearningActivitiesCompleted
          .filter(ah => isBetween(ah.createdAt, chartStartDate, chartEndDate));

        this.activitiesByMonth = this.getDataByMonth(sixMonthsHistories);
        NotifyPositive('Données mises à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des données.');
      } finally {
        this.loading = false;
      }
    },
    formatDuration (duration) {
      const durationInHours = duration.minutes / 60;
      const hours = Math.trunc(durationInHours);
      const paddedMinutes = (durationInHours - hours) * 60;

      return paddedMinutes ? `${hours}h${paddedMinutes}` : `${hours}h`;
    },
    formatProgramAttendances (attendancesGroupedByProgram, programId) {
      return {
        _id: programId,
        program: attendancesGroupedByProgram[programId][0].program.name,
        attendancesCount: attendancesGroupedByProgram[programId].length,
        duration: getTotalDuration(attendancesGroupedByProgram[programId].map(a => a.courseSlot)),
        attendances: attendancesGroupedByProgram[programId]
          .sort((a, b) => ascendingSort(a.courseSlot.startDate, b.courseSlot.startDate))
          .map(a => ({
            _id: a._id,
            date: formatDate(a.courseSlot.startDate),
            hours: `${formatIntervalHourly(a.courseSlot)} (${getDuration(a.courseSlot)})`,
            trainer: formatIdentity(get(a, 'course.trainer.identity'), 'FL'),
            misc: a.course.misc,
          })),
      };
    },
    async getUnsubscribedAttendances () {
      try {
        const query = { trainee: this.userProfile._id };
        const unsubscribedAttendancesGroupedByPrograms = await Attendances.listUnsubscribed(query);
        this.unsubscribedAttendances = Object.keys(unsubscribedAttendancesGroupedByPrograms)
          .map(programId => this.formatProgramAttendances(unsubscribedAttendancesGroupedByPrograms, programId));
      } catch (e) {
        console.error(e);
        this.unsubscribedAttendances = [];
        NotifyNegative('Erreur lors de la récupération des émargements non prévus.');
      }
    },
    formatDate,
    formatIntervalHourly,
    getDuration,
    isBefore,
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
.step-progress
  align-items: center
  justify-content: space-between
  width: 20%
  margin: 0px 24px
  flex-direction: row
  display: flex
  color: $primary

.dates
  @media screen and (min-width: 767px)
    width: 10%

.hours
  @media screen and (min-width: 767px)
    width: 15%

.trainer
  width: 50%

.misc
  width: 15%
</style>
