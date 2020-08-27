<template>
  <div v-if="answersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <div class="q-my-xl">
    <div v-for="(qcmAnswers, i) in card.qcmAnswers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model.trim="card.qcmAnswers[i].label" :required-field="i < 2"
          @focus="saveTmp(`qcmAnswers[${i}].label`)" @blur="updateAnswer(i)" />
        <q-checkbox :val="i" v-model="correctAnswerIndexes[i]" @input="updateCorrectAnswer(i)"
          :disable="!card.qcmAnswers[i].label" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</div>
</template>

<script>
/* eslint-disable no-console */
import times from 'lodash/times';
import get from 'lodash/get';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT } from '@data/constants';

export default {
  name: 'MultipleChoiceQuestion',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  data () {
    return {
      correctAnswerIndexes: [false, false, false, false],
      answersLengthInDb: 0,
    };
  },
  computed: {
    answersInitialized () {
      console.log('skusku', this.card);
      return this.card.qcmAnswers.length === MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT;
    },
  },
  async mounted () {
    this.initializeAnswers();
    this.updateCorrectAnswerIndexes();
  },
  watch: {
    card () {
      this.initializeAnswers();
      this.updateCorrectAnswerIndexes();
    },
  },
  methods: {
    initializeAnswers () {
      this.answersLengthInDb = this.card.qcmAnswers.length;
      this.card.qcmAnswers = times(
        MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT,
        i => this.card.qcmAnswers[i] || ({ label: '', correct: false })
      );
    },
    formatAnswersPayload () {
      return this.card.qcmAnswers
        .map((a, i) => ({ ...a, correct: this.correctAnswerIndexes[i] }))
        .filter(a => !!a.label);
    },
    updateCorrectAnswerIndexes () {
      this.card.qcmAnswers.forEach((ans, i) => { this.correctAnswerIndexes[i] = ans.correct; });
    },
    async updateAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `answers[${index}].label`)) return;

        // this.$v.card.answers.$touch();
        // if (this.requiredAnswerIsMissing(index)) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, { qcmAnswers: this.formatAnswersPayload() });
        await this.refreshCard();
        this.updateCorrectAnswerIndexes();

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async updateCorrectAnswer (index) {
      try {
        if (!this.card.qcmAnswers[index].label) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { qcmAnswers: this.formatAnswersPayload() });

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      } finally {
        await this.refreshCard();
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.answers
  display: flex
  flex-direction: row
  .input
    flex: 1
</style>
