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
    <div class="row justify-center">
      <q-card flat class="q-pa-md q-ma-md col-xs-12">
        <div class="text-weight-bold q-mb-sm">Apprenants les plus assidus</div>
        <div class="row justify-end">
          <div class="col-4 text-grey-800 text-center">Activités eLearning réalisées</div>
        </div>
        <div v-for="(learner, index) in learnerList.slice(0, 5)" :key="learner._id"
          class="flex justify-between items-center row">
          <div class="flex items-center col-8">
            <div class="elearning-indicator text-weight-bold text-pink-500 q-mx-md">{{ index + 1 }}</div>
            <q-item-section avatar>
              <img class="avatar" :src="learner.picture ? learner.picture.link : DEFAULT_AVATAR">
            </q-item-section>
            <div class="text-grey-800">{{ formatIdentity(learner.identity, 'FL') }}</div>
          </div>
          <div class="col-4 text-center">{{ learner.activityCount }}</div>
        </div>
      </q-card>
      <q-card flat class="q-pa-md q-mt-md col-xs-12">
        <div class="text-weight-bold q-mb-sm">Formations les plus suivies</div>
        <div class="row justify-end">
          <div class="col-4 text-grey-800 text-center">Nombre d'apprenants actifs</div>
        </div>
        <div v-for="(course, index) in courseList.slice(0, 5)" :key="course.name"
          class="flex justify-between items-center row">
          <div class="flex items-center col-8">
            <div class="elearning-indicator text-weight-bold text-pink-500 q-mx-md">{{ index + 1 }}</div>
            <div class="text-grey-800">{{ course.name }}</div>
          </div>
          <div class="col-4 text-center">{{ course.activeTraineesCount }}</div>
        </div>
      </q-card>
    </div>
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
import { formatIdentity } from '@helpers/utils';
import { DEFAULT_AVATAR } from '@data/constants';

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
      formatIdentity,
      DEFAULT_AVATAR,
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
      }).flat(), h => h.activity.step.subProgram.courses[0]._id));

      return groupedByCourses.map(group => ({
        name: group[0].activity.step.subProgram.program.name,
        activeTraineesCount: [...new Set(group.map(a => a.user))].length,
      })).sort((a, b) => b.activeTraineesCount - a.activeTraineesCount);
    },
    learnerList () {
      const groupedByLearners = Object.values(groupBy(this.activityHistories, h => h.user._id));

      return groupedByLearners.map(group => ({
        ...group[0].user,
        activityCount: group.length,
      })).sort((a, b) => b.activityCount - a.activityCount);
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
</style>
