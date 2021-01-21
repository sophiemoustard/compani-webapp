<template>
  <q-page class="client-background q-pb-xl" padding>
    <div class="q-mb-xl">
      <h4>La formation Compani dans ma structure</h4>
    </div>
    <q-card flat class="q-pa-md elearning-container">
      <div>
        <div class="text-weight-bold q-mb-sm">Le eLearning dans ma structure</div>
        <ni-date-range v-model="dates" class="dates" borders />
      </div>
      <div class="elearning">
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
    <q-card flat class="q-pa-md q-mt-md">
      <div class="text-weight-bold q-mb-sm">Formations les plus suivies</div>
      <ni-responsive-table :data="courseList" :columns="columns" />
    </q-card>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import ActivityHistories from '@api/ActivityHistories';
import DateRange from '@components/form/DateRange';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import moment from '@helpers/moment';
import ELearningIndicator from '@components/courses/ELearningIndicator';
import ResponsiveTable from '@components/table/ResponsiveTable';

export default {
  name: 'CourseDashboard',
  metaInfo: { title: 'Tableau de bord des formations' },
  components: {
    'ni-date-range': DateRange,
    'ni-e-learning-indicator': ELearningIndicator,
    'ni-responsive-table': ResponsiveTable,
  },
  data () {
    return {
      dates: {
        startDate: moment().subtract(30, 'd').startOf('d').toISOString(),
        endDate: moment().toISOString(),
      },
      activityHistories: [],
      columns: [{ name: 'nom', label: 'Nom', align: 'left', field: '0' }],
    };
  },
  computed: {
    activeLearners () {
      return uniqBy(this.activityHistories, 'user').length;
    },
    courseList () {
      return Object.entries(groupBy(this.activityHistories.map(activityHistory => ({
        ...activityHistory,
        name: get(activityHistory.activity.steps[0], 'subProgram.program.name', 'formation non trouvée'),
      })), course => course.name));
    },
  },
  watch: {
    async dates () {
      await this.getActivityHistories();
    },
  },
  async created () {
    await this.getActivityHistories();
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
  },
};
</script>

<style lang="stylus" scoped>
.elearning-container
  display: flex
  flex-direction: row
  @media screen and (max-width: 767px)
    flex-direction: column

.elearning
  display: flex
  flex-direction: row
  justify-content: space-around
  flex: 1
</style>
