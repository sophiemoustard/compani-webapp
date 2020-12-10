<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <ni-input caption="Bonne réponse" v-model="card.qcuGoodAnswer" required-field class="q-my-lg"
      @focus="saveTmp('qcuGoodAnswer')" :error="$v.card.qcuGoodAnswer.$error" :error-message="goodAnswerErrorMsg"
      @blur="updateCard('qcuGoodAnswer')" :disable="disableEdition" />
    <div class="q-my-lg">
      <ni-input v-for="(answer, i) in card.qcAnswers" :key="i" :caption="`Mauvaise réponse ${i + 1}`"
        v-model="card.qcAnswers[i].text" :required-field="i === 0" :error="qcuFalsyAnswerError(i)"
        :error-message="qcuFalsyAnswerErrorMsg(i)" @focus="saveTmp(`qcAnswers[${i}].text`)"
        @blur="updateFalsyAnswer(i)" :disable="disableEdition" />
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL, QUESTION_MAX_LENGTH, QC_ANSWER_MAX_LENGTH } from '@data/constants';
import { minTextArrayLength, minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'SingleChoiceQuestion',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin, validationMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        qcuGoodAnswer: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
        qcAnswers: {
          minLength: minTextArrayLength(1),
          minOneCorrectAnswer,
          $each: {
            text: { maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          },
        },
        explanation: { required },
      },
    };
  },
  computed: {
    goodAnswerErrorMsg () {
      if (!this.$v.card.qcuGoodAnswer.required) return REQUIRED_LABEL;
      if (!this.$v.card.qcuGoodAnswer.maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
  },
  methods: {
    qcuFalsyAnswerErrorMsg (index) {
      if (!this.$v.card.qcAnswers.$each[index].text.maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
    qcuFalsyAnswerError (index) {
      const exceedCharLength = this.$v.card.qcAnswers.$each[index].text.$error;
      const missingField = this.$v.card.qcAnswers.$error &&
        !this.$v.card.qcAnswers.minLength && index === 0 && !this.card.qcAnswers[index].text;

      return exceedCharLength || missingField;
    },
    async updateFalsyAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `qcAnswers[${index}].text`)) return;

        this.$v.card.qcAnswers.$touch();
        if (this.qcuFalsyAnswerError(index)) return NotifyWarning('Champ(s) invalide(s)');

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
  },
};
</script>
