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
    <q-card flat class="q-pa-md q-mt-md card">
      <div class="text-weight-bold q-mb-sm">Formations les plus suivies</div>
      <div class="flex justify-end text-grey-800">Nombre d'apprenants</div>
      <div v-for="(course, index) in courseList.slice(0, 5)" :key="course.name"
        class="flex justify-between items-center">
        <div class="flex items-center">
          <div class="elearning-indicator text-weight-bold text-pink-500 q-mx-md">{{ index + 1 }}</div>
          <div class="text-grey-800">{{ course.name }}</div>
        </div>
        {{ course.activeTraineesCount }}
      </div>
    </q-card>
  </q-page>
</template>

<script>
import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import ActivityHistories from '@api/ActivityHistories';
import DateRange from '@components/form/DateRange';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import moment from '@helpers/moment';
import ELearningIndicator from '@components/courses/ELearningIndicator';

export default {
  name: 'CourseDashboard',
  metaInfo: { title: 'Tableau de bord des formations' },
  components: {
    'ni-date-range': DateRange,
    'ni-e-learning-indicator': ELearningIndicator,
  },
  data () {
    return {
      dates: {
        startDate: moment().subtract(30, 'd').startOf('d').toISOString(),
        endDate: moment().toISOString(),
      },
      activityHistories: [],
    };
  },
  computed: {
    activeLearners () {
      return uniqBy(this.activityHistories, 'user').length;
    },
    courseList () {
      const groupedByCourses = Object.values(groupBy(this.activityHistories.map((aH) => {
        const res = [];
        for (const step of aH.activity.steps) res.push({ ...aH, activity: { ...omit(aH.activity, 'steps'), step } });
        return res;
      }).flat(), h => h.activity.step.subProgram.courses[0]._id));

      return groupedByCourses.map(group => ({
        name: group[0].activity.step.subProgram.program.name,
        activeTraineesCount: [...new Set(group.map(a => a.user))].length,
      })).sort((a, b) => b.activeTraineesCount - a.activeTraineesCount);
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

.elearning-indicator
  font-size: 36px

.card
  width: 50%
</style>
