<template>
  <div v-if="qcuFalsyAnswersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <ni-input caption="Bonne réponse" v-model.trim="card.qcuGoodAnswer" required-field class="q-my-lg"
      @focus="saveTmp('qcuGoodAnswer')" :error="$v.card.qcuGoodAnswer.$error" :error-message="goodAnswerErrorMsg"
      @blur="updateCard('qcuGoodAnswer')" :disable="disableEdition" />
    <div class="q-my-lg">
      <ni-input v-for="(answer, i) in card.qcuFalsyAnswers" :key="i" :caption="`Mauvaise réponse ${i + 1}`"
        v-model.trim="card.qcuFalsyAnswers[i]" :required-field="i === 0" :error="qcuFalsyAnswerError(i)"
        :error-message="qcuFalsyAnswerErrorMsg(i)" @focus="saveTmp(`qcuFalsyAnswers[${i}]`)"
        @blur="updateFalsyAnswer(i)" :disable="disableEdition" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import times from 'lodash/times';
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT, REQUIRED_LABEL, QUESTION_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH } from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
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
        qcuFalsyAnswers: {
          required,
          minLength: minArrayLength(1),
          $each: { maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
        },
        explanation: { required },
      },
    };
  },
  computed: {
    qcuFalsyAnswersInitialized () {
      return this.card.qcuFalsyAnswers.length === SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT;
    },
    goodAnswerErrorMsg () {
      if (!this.$v.card.qcuGoodAnswer.required) return REQUIRED_LABEL;
      if (!this.$v.card.qcuGoodAnswer.maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
  },
  watch: {
    card: {
      handler: 'initializeQcuFalsyAnswers',
      immediate: true,
    },
  },
  methods: {
    qcuFalsyAnswerErrorMsg (index) {
      if (!this.$v.card.qcuFalsyAnswers.$each[index].maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
    initializeQcuFalsyAnswers () {
      this.card.qcuFalsyAnswers = times(
        SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT,
        i => this.card.qcuFalsyAnswers[i] || ''
      );
    },
    qcuFalsyAnswerError (index) {
      const exceedCharLength = this.$v.card.qcuFalsyAnswers.$each[index].$error;
      const missingField = this.$v.card.qcuFalsyAnswers.$error &&
        !this.$v.card.qcuFalsyAnswers.minLength && index === 0 && !this.card.qcuFalsyAnswers[index];

      return exceedCharLength || missingField;
    },
    formatQcuFalsyAnswersPayload () {
      return this.card.qcuFalsyAnswers.filter(a => !!a);
    },
    async updateFalsyAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `qcuFalsyAnswers[${index}]`)) return;

        this.$v.card.qcuFalsyAnswers.$touch();
        if (this.qcuFalsyAnswerError(index)) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { qcuFalsyAnswers: this.formatQcuFalsyAnswersPayload() });

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
