<template>
  <div>
    <p class="text-weight-bold">Rapport d'utilisation</p>
    <div class="row justify-between">
      <div class="col-md-5 col-xs-12">
        <q-card flat class="q-pa-md right-stats global-view">
          <div class="text-weight-bold q-mb-sm">Vue globale</div>
          <div class="row">
            <div class="col-3 text-right q-pr-md column justify-around">
              <ni-e-learning-indicator :indicator="traineesOnGoingCount" />
              <ni-e-learning-indicator :indicator="traineesFinishedCount" />
            </div>
            <div class="col-9 column justify-around">
              <div>apprenant{{ traineesOnGoingCount > 1 ? 's' : '' }} en cours</div>
              <div>apprenant{{ traineesFinishedCount > 1 ? 's' : '' }} ayant terminé</div>
            </div>
          </div>
        </q-card>
      </div>
      <div class="col-md-6 col-xs-12">
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
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
          }],
        },
        legend: {
          display: false,
        },
      },
    };
  },
  computed: {
    traineesOnGoingCount () {
      return this.learners.filter(l => l.progress !== 1).length;
    },
    traineesFinishedCount () {
      return this.learners.length - this.traineesOnGoingCount;
    },
    traineesCountByMonth () {
      const limitDate = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
      const currentMonthBegining = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const activityHistories = this.learners
        .map(l => l.steps
          .map(s => s.activities
            .map(a => a.activityHistories
              .filter(ah => new Date(ah.date) > limitDate && new Date(ah.date) < currentMonthBegining)
              .map(ah => ({ user: ah.user, date: ah.date }))))).flat(3);

      const traineesByMonth = Object.values(groupBy(
        activityHistories,
        ah => `${new Date(ah.date).getFullYear()}${new Date(ah.date).getMonth() < 10
          ? `0${new Date(ah.date).getMonth()}`
          : `${new Date(ah.date).getMonth()}`}`
      ))
        .map(group => Object.values(groupBy(group, g => g.user)).length);

      while (traineesByMonth.length < 6) traineesByMonth.unshift(0);

      return traineesByMonth;
    },
    chartData () {
      return {
        labels: this.months,
        datasets: [{
          data: this.traineesCountByMonth,
          borderColor: colors.getBrand('primary'),
          backgroundColor: 'transparent',
        }],
      };
    },
    months () {
      const monthNames = ['janv', 'fév', 'mars', 'avril', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
      const res = [];
      for (let i = 6; i > 0; i -= 1) {
        const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        res.push(`${month} ${year}`);
      }
      return res;
    },
  },
};
</script>

<style lang="stylus" scoped>
.global-view
  height 100%;

.line-chart
  max-height 245px;
</style>
