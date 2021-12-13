<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" class="q-mb-lg" />
    <q-checkbox v-model="card.isMandatory" @input="updateCard('isMandatory')" label="Réponse obligatoire"
      class="q-mb-lg" dense :disable="disableEdition" />
    <q-checkbox v-model="card.isQuestionAnswerMultipleChoiced" @input="updateCard('isQuestionAnswerMultipleChoiced')"
      dense :disable="disableEdition" label="Sélection multiple" class="q-mb-lg" />
    <div v-for="(answer, i) in card.qcAnswers" :key="i" class="answers">
      <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" @focus="saveTmp(`qcAnswers[${i}].text`)"
        @blur="updateTextAnswer(i)" class="input" :disable="disableEdition" :required-field="answerIsRequired(i)"
        :error="$v.card.qcAnswers.$each[i].$error" :error-message="questionAnswerErrorMsg(i)" />
      <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
      :disable="disableAnswerCreation" />
  </div>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import Button from '@components/Button';
import {
  QUESTION_MAX_LENGTH,
  QUESTION_ANSWER_MAX_ANSWERS_COUNT,
  QUESTION_ANSWER_MIN_ANSWERS_COUNT,
  PUBLISHED,
  QC_ANSWER_MAX_LENGTH,
  REQUIRED_LABEL,
} from '@data/constants';
import { validationMixin } from '@mixins/validationMixin';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'QuestionAnswer',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [templateMixin, validationMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        qcAnswers: {
          $each: { text: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) } },
        },
      },
    };
  },
  computed: {
    disableAnswerCreation () {
      return this.card.qcAnswers.length >= QUESTION_ANSWER_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.qcAnswers.length <= QUESTION_ANSWER_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
  },
  methods: {
    questionAnswerErrorMsg (index) {
      if (!this.$v.card.qcAnswers.$each[index].text.required) return REQUIRED_LABEL;
      if (!this.$v.card.qcAnswers.$each[index].text.maxLength) return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;

      return '';
    },
    answerIsRequired (index) {
      return index < QUESTION_ANSWER_MIN_ANSWERS_COUNT;
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
