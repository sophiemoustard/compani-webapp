<template>
  <div v-if="followUp.subProgram">
    <div v-for="(step, stepIndex) of followUp.subProgram.steps" :key="stepIndex" class="q-mb-xl">
      <div class="text-weight-bold q-mb-sm">{{ stepIndex + 1 }} - {{ step.name }}</div>
      <q-card v-for="(activity, activityIndex) of step.activities" :key="activityIndex" flat class="q-mb-sm">
        <q-card-section class="cursor-pointer" @click="showCards(activity._id)">
          <div class="text-weight-bold">{{ activityIndex + 1 }} - {{ activity.name }}</div>
        </q-card-section>
        <div class="bg-peach-200 chart-container" v-if="areCardsDisplayed[activity._id]">
          <template v-for="(card, cardIndex) of activity.followUp">
            <survey-chart v-if="card.template === SURVEY" :key="cardIndex" class="chart" :card="card" />
            <open-question-chart v-if="card.template === OPEN_QUESTION" :key="cardIndex" class="chart" :card="card" />
            <question-answer-chart v-if="card.template === QUESTION_ANSWER" :key="cardIndex" class="chart"
              :card="card" />
          </template>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER } from '@data/constants';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'survey-chart': SurveyChart,
    'open-question-chart': OpenQuestionChart,
    'question-answer-chart': QuestionAnswerChart,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      followUp: {},
      areCardsDisplayed: {},
      SURVEY,
      OPEN_QUESTION,
      QUESTION_ANSWER,
    };
  },
  async created () {
    await this.refreshFollowUp();
  },
  methods: {
    async refreshFollowUp () {
      try {
        this.followUp = await Courses.getFollowUp(this.profileId);
      } catch (e) {
        this.followUp = {};
        NotifyNegative('Erreur lors de la récupération du suivi des stagiaires.');
        console.error(e);
      }
    },
    showCards (activityId) {
      this.$set(this.areCardsDisplayed, activityId, !this.areCardsDisplayed[activityId]);
    },
  },
};
</script>

<style lang="stylus" scoped>
.chart-container
  display: flex
  flex-direction: column

.chart
  margin: 8px 8px 8px 48px
</style>
