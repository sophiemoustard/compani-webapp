<template>
  <div v-if="answersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" :disable="disableEdition" />
    <div class="q-my-xl">
      <div v-for="(qcmAnswers, i) in card.qcmAnswers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model.trim="card.qcmAnswers[i].label" :required-field="i < 2"
          @focus="saveTmp(`qcmAnswers[${i}].label`)" @blur="updateAnswer(i)"
          :error="answersError(i)" :error-message="answersErrorMsg(i)" :disable="disableEdition" />
        <q-checkbox v-model="card.qcmAnswers[i].correct" @input="updateCorrectAnswer(i)"
          :disable="!card.qcmAnswers[i].label || disableEdition" />
      </div>
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import times from 'lodash/times';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT, REQUIRED_LABEL } from '@data/constants';
import { minLabelArrayLength, minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'MultipleChoiceQuestion',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        question: { required },
        qcmAnswers: {
          minLength: minLabelArrayLength(2),
          minOneCorrectAnswer,
        },
        explanation: { required },
      },
    };
  },
  computed: {
    answersInitialized () {
      return this.card.qcmAnswers.length === MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT;
    },
  },
  watch: {
    card: {
      handler: 'initializeAnswers',
      immediate: true,
    },
  },
  methods: {
    initializeAnswers () {
      this.card.qcmAnswers = times(
        MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT,
        i => this.card.qcmAnswers[i] || ({ label: '', correct: false })
      );
    },
    requiredAnswerIsMissing (index) {
      return index < 2 && !this.card.qcmAnswers[index].label && this.$v.card.qcmAnswers.$error;
    },
    requiredOneCorrectAnswer (index) {
      return !this.$v.card.qcmAnswers.minOneCorrectAnswer && !!this.card.qcmAnswers[index].label;
    },
    removeSingleCorrectAnswer (index) {
      return this.card.qcmAnswers.filter(a => a.correct).length === 1 && this.card.qcmAnswers[index].correct &&
        !this.card.qcmAnswers[index].label;
    },
    formatAnswersPayload () {
      return this.card.qcmAnswers.filter(a => !!a.label);
    },
    async updateAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `answers[${index}].label`)) return;

        this.$v.card.qcmAnswers.$touch();
        if (this.requiredAnswerIsMissing(index)) return NotifyWarning('Champ(s) invalide(s)');
        if (this.requiredOneCorrectAnswer(index) || this.removeSingleCorrectAnswer(index)) {
          return NotifyWarning('Une bonne réponse est nécessaire.');
        }

        await Cards.updateById(this.card._id, { qcmAnswers: this.formatAnswersPayload() });
        await this.refreshCard();

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async updateCorrectAnswer (index) {
      try {
        if (!this.card.qcmAnswers[index].label) return NotifyWarning('Champ(s) invalide(s)');
        if (this.requiredOneCorrectAnswer(index)) return NotifyWarning('Une bonne réponse est nécessaire.');

        await Cards.updateById(this.card._id, { qcmAnswers: this.formatAnswersPayload() });

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      } finally {
        await this.refreshCard();
      }
    },
    answersErrorMsg (index) {
      if (this.requiredAnswerIsMissing(index)) return REQUIRED_LABEL;
      if (this.requiredOneCorrectAnswer(index) || this.removeSingleCorrectAnswer(index)) {
        return 'Une bonne réponse est nécessaire.';
      }

      return '';
    },
    answersError (index) {
      return this.requiredAnswerIsMissing(index) || this.requiredOneCorrectAnswer(index) ||
        this.removeSingleCorrectAnswer(index);
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
