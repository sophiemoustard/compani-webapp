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
      <ni-line-chart :data="traineesByMonth" :labels="monthAxisLabels" title="Nombre d'apprenants dans le temps"
        class="col-md-6 col-xs-12 line-chart-container" />
    </div>
    <elearning-follow-up-table :learners="learners" :loading="learnersLoading" class="q-mt-xl" />
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import LineChart from '@components/charts/LineChart';
import { useTraineeFollowUp } from '@composables/traineeFollowUp';
import { useCharts } from '@composables/charts';
import CompaniDate from '@helpers/dates/companiDates';
import { MONTH, DAY } from '@data/constants';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-e-learning-indicator': ELearningIndicator,
    'elearning-follow-up-table': ElearningFollowUpTable,
    'ni-line-chart': LineChart,
  },
  props: {
    profileId: { type: String, required: true },
  },
  setup (props) {
    const { profileId } = toRefs(props);

    const traineesByMonth = ref([]);

    const { getCountsByMonth, monthAxisLabels } = useCharts();
    const { learners, learnersLoading, getFollowUp } = useTraineeFollowUp(profileId);

    const traineesOnGoingCount = computed(() => learners.value.filter(l => l.progress.eLearning !== 1).length);
    const traineesFinishedCount = computed(() => learners.value.length - traineesOnGoingCount.value);

    const computeChartData = () => {
      const startDate = CompaniDate().subtract('P6M').startOf(MONTH).toISO();
      const endDate = CompaniDate().subtract('P1M').endOf(MONTH).toISO();

      const activityHistories = learners.value.map(l => l.steps
        .map(s => s.activities
          .map(a => a.activityHistories
            .filter(ah => CompaniDate(ah.date).isSameOrBetween(startDate, endDate, DAY))
            .map(ah => ({ user: ah.user, date: ah.date })))))
        .flat(3);

      traineesByMonth.value = getCountsByMonth(activityHistories, 'user');
    };

    const created = async () => {
      await getFollowUp();
      computeChartData();
    };

    created();
    return {
      // Data
      learners,
      learnersLoading,
      monthAxisLabels,
      traineesByMonth,
      // Computed
      traineesOnGoingCount,
      traineesFinishedCount,
      // Methods
    };
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
