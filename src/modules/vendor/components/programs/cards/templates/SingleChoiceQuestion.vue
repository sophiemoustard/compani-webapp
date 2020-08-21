<template>
  <div v-if="answersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <div class="q-my-xl">
      <div v-for="(answer, i) in card.answers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model.trim="card.answers[i].label" :required-field="i < 2"
          @focus="saveTmp(`answers[${i}].label`)" :error="answersError(i)" @blur="updateAnswer(i)"
           :error-message="answersErrorMsg(i)" />
        <q-radio :val="i" v-model="correctAnswerIndex" @input="updateCorrectAnswer(i)"
          :disable="!card.answers[i].label" />
      </div>
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import times from 'lodash/times';
import get from 'lodash/get';
import Input from '@components/form/Input';
import Cards from '@api/Cards';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT, REQUIRED_LABEL } from '@data/constants';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { validationMixin } from '@mixins/validationMixin';

export default {
  name: 'SingleChoiceQuestion',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin, validationMixin],
  data () {
    return {
      correctAnswerIndex: null,
      answersLengthInDb: 0,
    };
  },
  computed: {
    answersInitialized () {
      return this.card.answers.length === SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT;
    },
  },
  async mounted () {
    this.initializeAnswers();
    this.updateCorrectAnswerIndex();
  },
  watch: {
    card () {
      this.initializeAnswers();
      this.updateCorrectAnswerIndex();
    },
  },
  methods: {
    initializeAnswers () {
      this.answersLengthInDb = this.card.answers.length;
      this.card.answers = times(
        SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT,
        i => this.card.answers[i] || ({ label: '', correct: i === 0 })
      );
    },
    updateCorrectAnswerIndex () {
      const correctAnswer = this.card.answers.find(a => a.correct);
      this.correctAnswerIndex = correctAnswer ? this.card.answers.indexOf(correctAnswer) : null;
    },
    answersErrorMsg (index) {
      if (this.requiredAnswerIsMissing(index)) return REQUIRED_LABEL;
      if (index === 0 && !this.$v.card.answers.only1Correct) {
        return 'Une bonne réponse est nécessaire.';
      }

      return '';
    },
    answersError (index) {
      return this.requiredAnswerIsMissing(index);
    },
    formatAnswersPayload () {
      return this.card.answers.map((a, i) => ({ ...a, correct: i === this.correctAnswerIndex })).filter(a => !!a.label);
    },
    requiredAnswerIsMissing (index) {
      return !this.$v.card.answers.minLength && index < 2 &&
        this.card.answers.filter(a => a.label).length < this.answersLengthInDb && !this.card.answers[index].label;
    },
    async updateCorrectAnswer (index) {
      try {
        if (!this.card.answers[index].label) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, { answers: this.formatAnswersPayload() });

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      } finally {
        await this.refreshCard();
      }
    },
    async updateAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `answers[${index}].label`)) return;

        this.$v.card.answers.$touch();
        if (this.requiredAnswerIsMissing(index)) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { answers: this.formatAnswersPayload() });

        await this.refreshCard();
        this.updateCorrectAnswerIndex();

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
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
