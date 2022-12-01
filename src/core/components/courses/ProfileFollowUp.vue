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
    <elearning-follow-up-table :learners="learners" :loading="tableLoading" class="q-mt-xl" />
  </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Courses from '@api/Courses';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import LineChart from '@components/charts/LineChart';
import { NotifyNegative } from '@components/popup/notify';
import { useCharts } from '@composables/charts';
import { formatIdentity } from '@helpers/utils';

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
    const $store = useStore();
    const $router = useRouter();

    const isVendorInterface = /\/ad\//.test($router.currentRoute.value.path);

    const learners = ref([]);
    const traineesByMonth = ref([]);
    const tableLoading = ref(false);

    const company = computed(() => $store.getters['main/getCompany']);

    const { getCountsByMonth, monthAxisLabels } = useCharts();

    const traineesOnGoingCount = computed(() => learners.value.filter(l => l.progress.eLearning !== 1).length);
    const traineesFinishedCount = computed(() => learners.value.length - traineesOnGoingCount.value);

    const formatRow = (trainee) => {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        _id: trainee._id,
        identity: { ...trainee.identity, fullName: formattedName },
        progress: trainee.progress,
        steps: trainee.steps,
        firstMobileConnection: trainee.firstMobileConnection,
      };
    };

    const getLearnersList = async () => {
      try {
        tableLoading.value = true;
        const course = await Courses.getFollowUp(
          profileId.value,
          isVendorInterface ? null : { company: company.value._id }
        );

        if (course) learners.value = Object.freeze(course.trainees.map(formatRow));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des apprenants');
        learners.value = [];
      } finally {
        tableLoading.value = false;
      }
    };

    const computeChartData = () => {
      const activityHistories = learners.value.map(l => l.steps
        .map(s => s.activities
          .map(a => a.activityHistories
            .map(ah => ({ user: ah.user, date: ah.date })))))
        .flat(3);

      traineesByMonth.value = getCountsByMonth(activityHistories, 'user');
    };

    const created = async () => {
      await getLearnersList();
      computeChartData();
    };

    created();
    return {
      // Data
      learners,
      tableLoading,
      monthAxisLabels,
      traineesByMonth,
      // Computed
      traineesOnGoingCount,
      traineesFinishedCount,
      // Methods
      formatRow,
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
