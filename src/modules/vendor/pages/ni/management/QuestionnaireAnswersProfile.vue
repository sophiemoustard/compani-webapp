<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header :title="questionnaireName" :header-info="headerInfo" />
    <div v-if="questionnaireAnswers.followUp.length">
      <q-card v-for="(card, cardIndex) of questionnaireAnswers.followUp" :key="cardIndex" flat class="q-mb-sm">
         <component :is="getChartComponent(card.template)" :card="card" />
      </q-card>
    </div>
    <div v-else class="text-italic q-mb-md">Aucune réponse au questionnaire</div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import ProfileHeader from '@components/ProfileHeader';
import SurveyChart from '@components/courses/SurveyChart';
import OpenQuestionChart from '@components/courses/OpenQuestionChart';
import QuestionAnswerChart from '@components/courses/QuestionAnswerChart';
import { NotifyNegative } from '@components/popup/notify';
import { SURVEY, OPEN_QUESTION, QUESTION_ANSWER, QUESTIONNAIRE_TYPES } from '@data/constants';

export default {
  name: 'QuestionnaireAnswersProfile',
  components: {
    'ni-profile-header': ProfileHeader,
  },
  props: {
    courseId: { type: String, required: true },
    questionnaireId: { type: String, required: true },
  },
  data () {
    return {
      questionnaireAnswers: [],
    };
  },
  computed: {
    headerInfo () {
      const { questionnaire, companyName, programName, misc } = this.questionnaireAnswers;
      const infos = [
        { icon: 'bookmark_border', label: QUESTIONNAIRE_TYPES[get(questionnaire, 'type', '')] },
        { icon: 'mdi-teach', label: `${companyName} - ${programName} ${misc ? `- ${misc}` : ''}` },
      ];
      return infos;
    },
    questionnaireName () {
      return get(this.questionnaireAnswers, 'questionnaire.name') || '';
    },
  },
  async created () {
    await this.getQuestionnaireAnswers();
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
    async getQuestionnaireAnswers () {
      try {
        this.questionnaireAnswers = await Questionnaires.getQuestionnaireAnswers(
          this.questionnaireId,
          { course: this.courseId }
        );
      } catch (e) {
        this.questionnaireAnswers = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    },
  },
};
</script>
