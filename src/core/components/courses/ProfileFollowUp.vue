<template>
  <div>
    <p class="text-weight-bold">Rapport d'utilisation</p>
    <div class="row">
      <div class="col-md-5 col-xs-12 q-mr-md">
        <q-card flat class="q-pa-md right-stats">
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
      <div class="col-md-5 col-xs-12">
        <q-card flat class="q-pa-md">
          <div class="text-weight-bold q-mb-sm">Nombre d'apprenants dans le temps</div>
          <line-chart :chart-data="chartData" :options="options" />
        </q-card>
      </div>
    </div>
    <trainee-follow-up-table :learners="learners" :loading="loading" class="q-mt-xl" />
  </div>
</template>

<script>
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
    chartData: {
      type: Object,
      default: () => ({
        labels: ['janv', 'fev'],
        datasets: [{
          label: 'test',
          data: [40, 20],
          borderColor: '#E2007A',
          backgroundColor: 'transparent',
        }],
      }),
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
      }),
    },
  },
  // data () {
  //   const months = [];
  //   return months;
  // },
  computed: {
    traineesOnGoingCount () {
      return this.learners.filter(l => l.progress !== 1).length;
    },
    traineesFinishedCount () {
      return this.learners.length - this.traineesOnGoingCount;
    },
    // traineeCountByMonth () {
    //   this.chartData.datasets.data = [40, 20];
    //   return this.chartData;
    // },
    // getMonths () {
    //   const monthNames = ['janv', 'fév', 'mars', 'avril', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov',
    // 'déc'];
    //   for (let i = 6; i > 0; i -= 1) {
    //     const d = new Date(Date.now().getFullYear(), Date.now().getMonth() - i, 1);
    //     const month = monthNames[d.getMonth()];
    //     const year = d.getFullYear();
    //     this.months.push(`${month} ${year}`);
    //   }
    //   return this.months;
    // },
  },
};
</script>
