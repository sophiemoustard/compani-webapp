<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" />
    <div class="q-my-lg answers-container">
      <div v-for="(qcAnswer, i) in card.qcAnswers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" :required-field="i < 2"
          @focus="saveTmp(`qcAnswers[${i}].text`)" @blur="updateTextAnswer(i)" :error-message="answersErrorMsg(i)"
          :error="$v.card.qcAnswers.$each[i].$error || requiredOneCorrectAnswer(i)" :disable="disableEdition" />
        <q-checkbox v-model="card.qcAnswers[i].correct" @input="updateCorrectAnswer(i)"
          :disable="!card.qcAnswers[i].text || disableEdition" />
      </div>
      <ni-button class="add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
        :disable="disableAnswerCreation" />
    </div>
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
} from '@data/constants';
import { minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
import Cards from '@api/Cards';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import Button from '@components/Button';

export default {
  name: 'MultipleChoiceQuestion',
  props: {
    disableEdition: { type: Boolean, default: false },
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
        this.disableEdition || this.activity.status === PUBLISHED;
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
  },
};
</script>

<style lang="stylus" scoped>
  .answers
    display: flex
    flex-direction: row
    &-container
      display: flex
      flex-direction: column
  .input
    flex: 1
  .add-button
    align-self: flex-end
</style>
