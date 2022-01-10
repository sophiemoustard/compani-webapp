<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" class="q-mb-lg" />
    <ni-input caption="Bonne réponse" v-model="card.qcuGoodAnswer" required-field class="q-mb-lg"
      @focus="saveTmp('qcuGoodAnswer')" :error="v$.card.qcuGoodAnswer.$error" :error-message="goodAnswerErrorMsg"
      @blur="updateCard('qcuGoodAnswer')" :disable="disableEdition" />
    <div v-for="(answer, i) in card.qcAnswers" :key="i" class="answers">
      <ni-input :caption="`Mauvaise réponse ${i + 1}`" class="input"
        v-model="card.qcAnswers[i].text" :error="getError('qcAnswers', i)"
        :error-message="qcuFalsyAnswerErrorMsg(i)" @focus="saveTmp(`qcAnswers[${i}].text`)"
        @blur="updateTextAnswer(i)" :disable="disableEdition" :required-field="answerIsRequired(i)" />
      <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="add-button q-mb-lg" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
      :disable="disableAnswerCreation" />
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="v$.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, maxLength, helpers } from '@vuelidate/validators';
import Input from '@components/form/Input';
import {
  REQUIRED_LABEL,
  QUESTION_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH,
  SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT,
  PUBLISHED,
  SINGLE_CHOICE_QUESTION_MIN_FALSY_ANSWERS_COUNT,
} from '@data/constants';
import { validationMixin } from '@mixins/validationMixin';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import Button from '@components/Button';

export default {
  name: 'SingleChoiceQuestion',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [templateMixin, validationMixin],
  setup () {
    return { v$: useVuelidate() };
  },
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        qcuGoodAnswer: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
        qcAnswers: {
          $each: helpers.forEach({
            text: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          }),
        },
        explanation: { required },
      },
    };
  },
  computed: {
    goodAnswerErrorMsg () {
      if (get(this.v$, 'card.qcuGoodAnswer.required.$response') === false) return REQUIRED_LABEL;
      if (get(this.v$, 'card.qcuGoodAnswer.maxLength.$response') === false) {
        return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;
      }

      return '';
    },
    disableAnswerCreation () {
      return this.card.qcAnswers.length >= SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.qcAnswers.length <= SINGLE_CHOICE_QUESTION_MIN_FALSY_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
  },
  methods: {
    qcuFalsyAnswerErrorMsg (index) {
      const validation = this.v$.card.qcAnswers.$each.$response.$errors[index].text;

      if (get(validation, '0.$validator') === 'required') return REQUIRED_LABEL;
      if (get(validation, '0.$validator') === 'maxLength') return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;

      return '';
    },
    answerIsRequired (index) {
      return index < SINGLE_CHOICE_QUESTION_MIN_FALSY_ANSWERS_COUNT;
    },
  },
};
</script>

<style lang="sass" scoped>
  .container
    display: flex
    flex-direction: column
  .answers
    display: flex
    justify-content: space-between
  .input
    flex: 1
  .add-button
    align-self: flex-end
</style>
