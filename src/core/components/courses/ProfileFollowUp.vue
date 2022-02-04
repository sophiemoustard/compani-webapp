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
      <ni-line-chart :data="this.traineesByMonth" :labels="months" title="Nombre d'apprenants dans le temps"
        class="col-md-6 col-xs-12 line-chart-container" />
    </div>
    <elearning-follow-up-table :learners="learners" :loading="loading" class="q-mt-xl" />
  </div>
</template>

<script>
import ELearningIndicator from '@components/courses/ELearningIndicator';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import LineChart from '@components/charts/LineChart';
import { traineeFollowUpTableMixin } from '@mixins/traineeFollowUpTableMixin';
import { chartMixin } from '@mixins/chartMixin';

export default {
  name: 'ProfileFollowUp',
  mixins: [traineeFollowUpTableMixin, chartMixin],
  components: {
    'ni-e-learning-indicator': ELearningIndicator,
    'elearning-follow-up-table': ElearningFollowUpTable,
    'ni-line-chart': LineChart,
  },
  props: {
    profileId: { type: String, required: true },
  },
  async created () {
    await this.getLearnersList();
    this.computeChartData();
  },
  computed: {
    traineesOnGoingCount () {
      return this.learners.filter(l => l.progress.eLearning !== 1).length;
    },
    traineesFinishedCount () {
      return this.learners.length - this.traineesOnGoingCount;
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

      this.traineesByMonth = this.getDataByMonth(activityHistories, 'user');
    },
  },
};
</script>

<style lang="sass" scoped>
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
