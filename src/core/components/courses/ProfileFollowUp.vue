<template>
  <div>
    <p class="text-weight-bold">Rapport d'utilisation</p>
    <div class="row justify-between">
      <div class="col-md-6 col-xs-12 global-view-container">
        <q-card flat class="q-pa-md right-stats global-view column">
          <div class="text-weight-bold">Vue globale</div>
          <div class="self-center justify-center column learners-data">
            <div class="row items-center">
              <ni-e-learning-indicator :indicator="traineesOnGoingCount" class="q-pr-sm" />
              <div>apprenant{{ traineesOnGoingCount > 1 ? 's' : '' }} en cours</div>
            </div>
            <div class="row items-center">
              <ni-e-learning-indicator :indicator="traineesFinishedCount" class="q-pr-sm" />
              <div>apprenant{{ traineesFinishedCount > 1 ? 's' : '' }} ayant terminé</div>
            </div>
          </div>
        </q-card>
      </div>
      <div class="col-md-6 col-xs-12 line-chart-container">
        <q-card flat class="q-pa-md">
          <div class="text-weight-bold q-mb-md">Nombre d'apprenants dans le temps</div>
          <line-chart :chart-data="chartData" :options="options" class="line-chart" />
        </q-card>
      </div>
    </div>
    <trainee-follow-up-table :learners="learners" :loading="loading" class="q-mt-xl" />
  </div>
</template>

<script>
import { colors } from 'quasar';
import groupBy from 'lodash/groupBy';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import TraineeFollowUpTable from '@components/courses/TraineeFollowUpTable';
import LineChart from '@components/LineChart';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';

export default {
  name: 'ProfileFollowUp',
  mixins: [traineeFollowUpTableMixin],
  components: {
    'ni-e-learning-indicator': ELearningIndicator,
    'trainee-follow-up-table': TraineeFollowUpTable,
    'line-chart': LineChart,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
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
  async created () {
    await this.getLearnersList();
    this.computeChartData();
  },
  computed: {
    traineesOnGoingCount () {
      return this.learners.filter(l => l.progress !== 1).length;
    },
    traineesFinishedCount () {
      return this.learners.length - this.traineesOnGoingCount;
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
  methods: {
    computeChartData () {
      const chartStartDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
      const chartEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const activityHistories = this.learners.map(l => l.steps
        .map(s => s.activities
          .map(a => a.activityHistories
            .filter(ah => new Date(ah.date) >= chartStartDate && new Date(ah.date) < chartEndDate)
            .map(ah => ({ user: ah.user, date: ah.date })))))
        .flat(3);

      const activitiesByMonth = groupBy(
        activityHistories,
        ah => `${new Date(ah.date).getFullYear()}${new Date(ah.date).getMonth() < 10
          ? `0${new Date(ah.date).getMonth()}`
          : `${new Date(ah.date).getMonth()}`
        }`
      );

      const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
      const monthlyTrainees = [];
      for (let i = 6; i > 0; i -= 1) {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        this.months.push(`${month} ${year}`);
        const field = `${date.getMonth() < 10
          ? `${date.getFullYear()}0${date.getMonth()}`
          : `${date.getFullYear()}${date.getMonth()}`}`;

        if (!activitiesByMonth[field]) monthlyTrainees.push(0);
        else monthlyTrainees.push(Object.values(groupBy(activitiesByMonth[field], group => group.user)).length);
      }
      this.traineesByMonth = monthlyTrainees;
    },
  },
};
</script>

<style lang="stylus" scoped>
.global-view
  height: 100%;
  &-container
    @media screen and (min-width: $breakpoint-sm-max)
      padding-right: 16px;

.line-chart
  max-height: 200px;
  &-container
    @media screen and (max-width: $breakpoint-sm-max)
      margin-top: 16px;

.learners-data
  flex: 1;
</style>
