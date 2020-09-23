<template>
  <div v-if="falsyAnswersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <ni-input caption="Bonne réponse" v-model.trim="card.qcuGoodAnswer" required-field class="q-my-lg"
      @focus="saveTmp('qcuGoodAnswer')" :error="$v.card.qcuGoodAnswer.$error" :error-message="goodAnswerErrorMsg"
      @blur="updateCard('qcuGoodAnswer')" :disable="disableEdition" />
    <div class="q-my-lg">
      <ni-input v-for="(answer, i) in card.falsyAnswers" :key="i" :caption="`Mauvaise réponse ${i + 1}`"
        v-model.trim="card.falsyAnswers[i]" :required-field="i === 0" :error="falsyAnswerError(i)"
        :error-message="falsyAnswerErrorMsg(i)" @focus="saveTmp(`falsyAnswers[${i}]`)"
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
        falsyAnswers: {
          required,
          minLength: minArrayLength(1),
          $each: { maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
        },
        explanation: { required },
      },
    };
  },
  computed: {
    falsyAnswersInitialized () {
      return this.card.falsyAnswers.length === SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT;
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
      handler: 'initializeFalsyAnswers',
      immediate: true,
    },
  },
  methods: {
    falsyAnswerErrorMsg (index) {
      if (!this.$v.card.falsyAnswers.$each[index].maxLength) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      return '';
    },
    initializeFalsyAnswers () {
      this.card.falsyAnswers = times(
        SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT,
        i => this.card.falsyAnswers[i] || ''
      );
    },
    falsyAnswerError (index) {
      const exceedCharLength = this.$v.card.falsyAnswers.$each[index].$error;
      const missingField = this.$v.card.falsyAnswers.$error &&
        !this.$v.card.falsyAnswers.minLength && index === 0 && !this.card.falsyAnswers[index];

      return exceedCharLength || missingField;
    },
    formatFalsyAnswersPayload () {
      return this.card.falsyAnswers.filter(a => !!a);
    },
    async updateFalsyAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `falsyAnswers[${index}]`)) return;

        this.$v.card.falsyAnswers.$touch();
        if (this.falsyAnswerError(index)) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { falsyAnswers: this.formatFalsyAnswersPayload() });

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
