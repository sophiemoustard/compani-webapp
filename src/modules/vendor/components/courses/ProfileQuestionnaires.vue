<template>
  <div>
    <q-card v-for="(card, cardIndex) of questionnaireAnswers" :key="cardIndex" flat class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';
import { NotifyNegative } from '@components/popup/notify';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER } from '@data/constants';

export default {
  name: 'ProfileQuestionnaires',
  components: {
    'survey-chart': SurveyChart,
    'open-question-chart': OpenQuestionChart,
    'question-answer-chart': QuestionAnswerChart,
  },
  computed: {
    ...mapState('course', ['course']),
  },
  data () {
    return {
      questionnaireAnswers: [],
    };
  },
  async created () {
    try {
      this.questionnaireAnswers = await Courses.getQuestionnaireAnswers(this.course._id);
    } catch (e) {
      this.questionnaireAnswers = [];
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des questionnaires.');
    }
  },
  methods: {
    getChartComponent (template) {
      switch (template) {
        case SURVEY:
          return SurveyChart;
        case OPEN_QUESTION:
          return OpenQuestionChart;
        case QUESTION_ANSWER:
          return QuestionAnswerChart;
      }
    },
  },
};
</script>
