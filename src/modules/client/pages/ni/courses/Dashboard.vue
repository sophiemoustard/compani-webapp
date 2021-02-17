<template>
  <q-page class="client-background" padding>
    <div class="flex no-wrap justify-between">
      <h4>La formation Compani dans ma structure</h4>
    </div>
    <div class="flex justify-between q-mt-xl">
      <p class="text-weight-bold">Chiffre généraux</p>
      <ni-date-range v-model="dates" class="dates" borders />
    </div>
    <q-card flat class="q-pa-md row">
      <div class="text-weight-bold q-mb-sm col-md-4 col-xs-12">Le eLearning dans ma structure</div>
      <div class="row justify-around col-md-8 col-xs-12">
        <div class="column items-center">
          <ni-e-learning-indicator :indicator="activeLearners" />
          <div class="text-center">apprenants actifs</div>
        </div>
        <div class="column items-center">
          <ni-e-learning-indicator :indicator="activityHistories.length" />
          <div class="text-center">activités de eLearning réalisées</div>
        </div>
      </div>
    </q-card>
    <div class="row q-mt-md">
      <div class="col-xs-12 col-md-6 left-card">
        <q-card flat class="fit q-pa-md">
          <div class="text-weight-bold q-mb-sm">Apprenants les plus assidus</div>
          <div class="row justify-end">
            <div class="col-4 text-grey-800 text-center">Activités eLearning réalisées</div>
          </div>
          <div v-for="(learner, index) in learnerList.slice(0, 5)" :key="learner._id"
            class="justify-between items-center row q-my-sm">
            <div class="flex no-wrap items-center col-8">
              <ni-e-learning-indicator :indicator="index + 1" />
              <img class="q-mx-md avatar" :src="learner.picture ? learner.picture.link : DEFAULT_AVATAR">
              <div class="text-grey-800">{{ formatIdentity(learner.identity, 'FL') }}</div>
            </div>
            <div class="col-4 text-center">{{ learner.activityCount }}</div>
          </div>
        </q-card>
      </div>
      <div class="col-xs-12 col-md-6 right-card">
        <q-card flat class="fit q-pa-md">
          <div class="text-weight-bold q-mb-sm">Formations les plus suivies</div>
          <div class="row justify-end">
            <div class="col-4 text-grey-800 text-center">Nombre d'apprenants actifs</div>
          </div>
          <div v-for="(course, index) in courseList.slice(0, 5)" :key="course.name"
            class="justify-between items-center row q-my-sm">
            <div class="flex no-wrap items-center col-8">
              <ni-e-learning-indicator :indicator="index + 1" />
              <div class="q-mx-md text-grey-800">{{ upperCaseFirstLetter(course.name) }}</div>
            </div>
            <div class="col-4 text-center">{{ course.activeTraineesCount }}</div>
          </div>
        </q-card>
      </div>
    </div>
    <p class="text-weight-bold q-mt-xl">Evolution dans le temps</p>
    <ni-line-chart title="Apprenants actifs mensuels" :chart-data="chartData" :options="options"
      class="q-mt-md line-chart-container" />
  </q-page>
</template>

<script>
import { colors } from 'quasar';
import omit from 'lodash/omit';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import ActivityHistories from '@api/ActivityHistories';
import DateRange from '@components/form/DateRange';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import LineChart from '@components/lineChart/LineChart';
import { DEFAULT_AVATAR } from '@data/constants';
import moment from '@helpers/moment';
import { formatIdentity, upperCaseFirstLetter } from '@helpers/utils';

export default {
  name: 'CourseDashboard',
  metaInfo: { title: 'Tableau de bord des formations' },
  components: {
    'ni-date-range': DateRange,
    'ni-e-learning-indicator': ELearningIndicator,
    'ni-line-chart': LineChart,
  },
  data () {
    return {
      dates: {
        startDate: moment().subtract(30, 'd').startOf('d').toISOString(),
        endDate: moment().toISOString(),
      },
      activityHistories: [],
      formatIdentity,
      upperCaseFirstLetter,
      DEFAULT_AVATAR,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
        legend: { display: false },
      },
      months: [],
      traineesByMonth: [],
    };
  },
  computed: {
    activeLearners () {
      return uniqBy(this.activityHistories, 'user._id').length;
    },
    courseList () {
      const groupedByCourses = Object.values(groupBy(this.activityHistories.map((aH) => {
        const res = [];
        for (const step of aH.activity.steps) res.push({ ...aH, activity: { ...omit(aH.activity, 'steps'), step } });
        return res;
      }).flat(), h => get(h, 'activity.step.subProgram.courses[0]._id')));

      return groupedByCourses.map(group => ({
        name: get(group[0], 'activity.step.subProgram.program.name'),
        activeTraineesCount: new Set(group.map(a => a.user._id)).size,
      })).sort((a, b) => b.activeTraineesCount - a.activeTraineesCount);
    },
    learnerList () {
      const groupedByLearners = Object.values(groupBy(this.activityHistories, h => h.user._id));

      return groupedByLearners.map(group => ({ ...group[0].user, activityCount: group.length }))
        .sort((a, b) => b.activityCount - a.activityCount);
    },
    chartData () {
      return {
        labels: this.months,
        datasets: [{
          data: this.traineesByMonth,
          borderColor: colors.getBrand('primary'),
          backgroundColor: 'transparent',
        }],
      };
    },
  },
  watch: {
    async dates () {
      await this.getActivityHistories();
    },
  },
  async created () {
    await this.getActivityHistories();
    await this.computeChartData();
  },
  methods: {
    async getActivityHistories () {
      try {
        if (!this.dates.startDate || moment(this.dates.startDate).isAfter(this.dates.endDate)) return;
        const { endDate } = this.dates;
        this.activityHistories = await ActivityHistories.list({
          ...this.dates,
          endDate: moment(endDate).endOf('d').toISOString(),
        });
        NotifyPositive('Données mises a jour.');
      } catch (e) {
        this.activityHistories = [];
        console.error(e);
        NotifyNegative('Erreur lors de la recupération des données.');
      }
    },
    formatMonthAndYear (date) {
      return `${new Date(date).getFullYear()}${new Date(date).getMonth() < 10
        ? `0${new Date(date).getMonth()}`
        : `${new Date(date).getMonth()}`
      }`;
    },
    async computeChartData () {
      try {
        const chartStartDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
        const chartEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const lastSixMonthsActivityHistories = await ActivityHistories.list({
          startDate: chartStartDate,
          endDate: chartEndDate,
        });

        const activityHistoriesByMonth = groupBy(
          lastSixMonthsActivityHistories,
          ah => this.formatMonthAndYear(ah.date)
        );

        const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
        const monthlyTrainees = [];
        for (let i = 6; i > 0; i -= 1) {
          const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          this.months.push(`${month} ${year}`);

          const field = this.formatMonthAndYear(date);

          if (!activityHistoriesByMonth[field]) monthlyTrainees.push(0);
          else {
            monthlyTrainees.push(
              Object.values(groupBy(activityHistoriesByMonth[field], group => group.user._id)).length
            );
          }
          this.traineesByMonth = monthlyTrainees;
        }

        NotifyPositive('Données mises a jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la recupération des données.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.left-card
  @media screen and (min-width: $breakpoint-md-min)
    padding-right: 16px
  @media screen and (max-width: $breakpoint-sm-max)
    padding-bottom: 16px

.rigth-card
  @media screen and (min-width: $breakpoint-md-min)
    padding-left: 16px
  @media screen and (max-width: $breakpoint-sm-max)
    padding-top: 16px

.line-chart-container
  width: 50%;
  padding-right: 16px;
</style>
