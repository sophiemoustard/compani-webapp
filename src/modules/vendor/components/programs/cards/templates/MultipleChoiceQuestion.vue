<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <div class="q-my-xl">
      <div v-for="(qcAnswer, i) in card.qcAnswers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" :required-field="i < 2"
          @focus="saveTmp(`qcAnswers[${i}].text`)" @blur="updateAnswer(i)"
          :error="answersError(i)" :error-message="answersErrorMsg(i)" :disable="disableEdition" />
        <q-checkbox v-model="card.qcAnswers[i].correct" @input="updateCorrectAnswer(i)"
          :disable="!card.qcAnswers[i].text || disableEdition" />
      </div>
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL, QUESTION_MAX_LENGTH, QC_ANSWER_MAX_LENGTH } from '@data/constants';
import { minTextArrayLength, minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
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
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        qcAnswers: {
          minLength: minTextArrayLength(2),
          minOneCorrectAnswer,
          $each: {
            text: { maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          },
        },
        explanation: { required },
      },
    };
  },
  methods: {
    requiredAnswerIsMissing (index) {
      return index < 2 && !this.card.qcAnswers[index].text && this.$v.card.qcAnswers.$error;
    },
    requiredOneCorrectAnswer (index) {
      return !this.$v.card.qcAnswers.minOneCorrectAnswer && !!this.card.qcAnswers[index].text;
    },
    removeSingleCorrectAnswer (index) {
      return this.card.qcAnswers.filter(a => a.correct).length === 1 && this.card.qcAnswers[index].correct &&
        !this.card.qcAnswers[index].text;
    },
    formatAnswersPayload () {
      return { qcAnswers: this.card.qcAnswers.filter(a => !!a.text).map(a => ({ ...a, text: a.text.trim() })) };
    },
    async updateAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `qcAnswers[${index}].text`)) return;

        this.$v.card.qcAnswers.$touch();
        if (this.requiredAnswerIsMissing(index) || this.$v.card.qcAnswers.$each[index].$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }
        if (this.requiredOneCorrectAnswer(index) || this.removeSingleCorrectAnswer(index)) {
          return NotifyWarning('Une bonne réponse est nécessaire.');
        }

        await Cards.updateById(this.card._id, this.formatAnswersPayload());

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async updateCorrectAnswer (index) {
      try {
        if (!this.card.qcAnswers[index].text || this.$v.card.qcAnswers.$each[index].$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }
        if (this.requiredOneCorrectAnswer(index)) return NotifyWarning('Une bonne réponse est nécessaire.');

        await Cards.updateById(this.card._id, this.formatAnswersPayload());

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    answersErrorMsg (index) {
      if (this.requiredAnswerIsMissing(index)) return REQUIRED_LABEL;
      if (this.requiredOneCorrectAnswer(index) || this.removeSingleCorrectAnswer(index)) {
        return 'Une bonne réponse est nécessaire.';
      }
      if (!this.$v.card.qcAnswers.$each[index].text.maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
    answersError (index) {
      const exceedCharLength = this.$v.card.qcAnswers.$each[index].$error;
      const missingField = this.requiredAnswerIsMissing(index) || this.requiredOneCorrectAnswer(index) ||
        this.removeSingleCorrectAnswer(index);
      return exceedCharLength || missingField;
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
