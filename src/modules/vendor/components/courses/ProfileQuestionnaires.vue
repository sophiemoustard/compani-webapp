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
import { NotifyNegative } from '@components/popup/notify';
import { questionnaireAnswersMixin } from 'src/modules/vendor/mixins/questionnaireAnswersMixin';

export default {
  name: 'ProfileQuestionnaires',
  mixins: [questionnaireAnswersMixin],
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
};
</script>
