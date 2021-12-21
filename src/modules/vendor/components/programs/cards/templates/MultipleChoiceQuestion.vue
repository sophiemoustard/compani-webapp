<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" class="q-mb-lg" />
    <div v-for="(qcAnswer, i) in card.qcAnswers" :key="i" class="answers">
      <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" class="input"
        @focus="saveTmp(`qcAnswers[${i}].text`)" @blur="updateTextAnswer(i)" :error-message="answersErrorMsg(i)"
        :error="$v.card.qcAnswers.$each[i].$error || requiredOneCorrectAnswer(i)" :disable="disableEdition"
        :required-field="answerIsRequired(i)" />
      <q-checkbox v-model="card.qcAnswers[i].correct" @input="updateCorrectAnswer(i)"
        :disable="!card.qcAnswers[i].text || disableEdition" />
      <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="q-mb-lg add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
      :disable="disableAnswerCreation" />
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import {
  REQUIRED_LABEL,
  QUESTION_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH,
  PUBLISHED,
  MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT,
  MULTIPLE_CHOICE_QUESTION_MIN_ANSWERS_COUNT,
} from '@data/constants';
import { minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
import Cards from '@api/Cards';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import Button from '@components/Button';

export default {
  name: 'MultipleChoiceQuestion',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        qcAnswers: {
          minOneCorrectAnswer,
          $each: {
            text: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          },
        },
        explanation: { required },
      },
    };
  },
  computed: {
    disableAnswerCreation () {
      return this.card.qcAnswers.length >= MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.qcAnswers.length <= MULTIPLE_CHOICE_QUESTION_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
  },
  methods: {
    requiredOneCorrectAnswer (index) {
      return !this.$v.card.qcAnswers.minOneCorrectAnswer && !!this.card.qcAnswers[index].text;
    },
    async updateCorrectAnswer (index) {
      try {
        const editedAnswer = get(this.card, `qcAnswers[${index}]`);

        await Cards.updateAnswer(
          { cardId: this.card._id, answerId: editedAnswer._id },
          { correct: editedAnswer.correct }
        );

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    answersErrorMsg (index) {
      if (!this.$v.card.qcAnswers.$each[index].text.required) return REQUIRED_LABEL;
      if (this.requiredOneCorrectAnswer(index)) return 'Une bonne réponse est nécessaire.';
      if (!this.$v.card.qcAnswers.$each[index].text.maxLength) return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;

      return '';
    },
    answerIsRequired (index) {
      return index < MULTIPLE_CHOICE_QUESTION_MIN_ANSWERS_COUNT;
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
    flex-direction: row
  .input
    flex: 1
  .add-button
    align-self: flex-end
</style>
