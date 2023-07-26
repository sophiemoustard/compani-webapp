<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header :title="questionnaireName" :header-info="headerInfo" />
    <q-card v-for="(card, cardIndex) of questionnaireAnswers.followUp" :key="cardIndex" flat class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import Questionnaires from '@api/Questionnaires';
import ProfileHeader from '@components/ProfileHeader';
import { NotifyNegative } from '@components/popup/notify';
import { QUESTIONNAIRE_TYPES } from '@data/constants';
import { questionnaireAnswersMixin } from 'src/modules/vendor/mixins/questionnaireAnswersMixin';

export default {
  name: 'QuestionnaireAnswersProfile',
  mixins: [questionnaireAnswersMixin],
  components: {
    'ni-profile-header': ProfileHeader,
  },
  props: {
    courseId: { type: String, required: true },
    questionnaireId: { type: String, required: true },
  },
  data () {
    return {
      questionnaireAnswers: {},
      get,
    };
  },
  computed: {
    headerInfo () {
      const { questionnaire, course } = this.questionnaireAnswers;
      const questionnaireType = get(questionnaire, 'type', '');
      const companyName = get(course, 'companyName') || '';
      const programName = get(course, 'programName') || '';
      const misc = get(course, 'misc') || '';
      return [
        { icon: 'bookmark_border', label: QUESTIONNAIRE_TYPES[questionnaireType] },
        {
          icon: 'mdi-teach',
          label: `${companyName ? `${companyName} - ` : ''}${programName}${misc ? ` - ${misc}` : ''}`,
        },
      ];
    },
    questionnaireName () {
      return get(this.questionnaireAnswers, 'questionnaire.name') || '';
    },
  },
  async created () {
    await this.getQuestionnaireAnswers();
  },
  methods: {
    async getQuestionnaireAnswers () {
      try {
        const qa = await Questionnaires.getQuestionnaireAnswers(this.questionnaireId, { course: this.courseId });

        this.questionnaireAnswers = {
          ...qa,
          followUp: qa.followUp.map(fu => ({ ...fu, answers: fu.answers.map(a => a.answer) })),
        };
      } catch (e) {
        this.questionnaireAnswers = {};
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    },
  },
};
</script>
