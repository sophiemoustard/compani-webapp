<template>
  <div>
    <q-card v-for="(card, cardIndex) of questionnaireAnswers.followUp" :key="cardIndex" flat class="q-mb-sm">
      <component :is="getChartComponent(card.template)" :card="card" />
    </q-card>
  </div>
</template>

<script>
import Questionnaires from '@api/Questionnaires';
import { NotifyNegative } from '@components/popup/notify';
import { questionnaireAnswersMixin } from '@mixins/questionnaireAnswersMixin';

export default {
  name: 'ProfileAnswers',
  mixins: [questionnaireAnswersMixin],
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      questionnaireAnswers: [],
    };
  },
  async created () {
    await this.getQuestionnaireAnswers();
  },
  methods: {
    async getQuestionnaireAnswers () {
      try {
        this.questionnaireAnswers = await Questionnaires.getQuestionnaireAnswers(this.profileId);
      } catch (e) {
        this.questionnaireAnswers = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des réponses au questionnaire.');
      }
    },
  },
};
</script>
