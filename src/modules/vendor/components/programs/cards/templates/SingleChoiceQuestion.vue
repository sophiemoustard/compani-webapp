<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="errorMsg('question')"
      type="textarea" :disable="disableEdition" class="q-mb-lg" />
    <div v-for="(answer, i) in card.qcAnswers" :key="i" class="answers">
      <ni-input :caption="answer.isCorrect ? 'Bonne réponse' : `Mauvaise réponse ${i}`" :disable="disableEdition"
        :class="answer.isCorrect ? 'q-mb-lg input' : 'input'" v-model="card.qcAnswers[i].text"
        :error="getError('qcAnswers', i)" :error-message="qcAnswerErrorMsg(i)" @blur="updateTextAnswer(i)"
        @focus="saveTmp(`qcAnswers[${i}].text`)" :required-field="answerIsRequired(i)" />
      <ni-button v-if="!answer.isCorrect" icon="delete" @click="validateAnswerDeletion(i)"
        :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="add-button q-mb-lg" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
      :disable="disableAnswerCreation" />
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="v$.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, maxLength, helpers } from '@vuelidate/validators';
import Input from '@components/form/Input';
import {
  REQUIRED_LABEL,
  QUESTION_OR_TITLE_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH,
  PUBLISHED,
  CHOICE_QUESTION_MAX_ANSWERS_COUNT,
  CHOICE_QUESTION_MIN_ANSWERS_COUNT,
} from '@data/constants';
import Button from '@components/Button';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

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
  emits: ['refresh'],
  setup (props, { emit }) {
    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const { disableEdition, cardParent } = toRefs(props);

    const rules = {
      card: {
        question: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
        qcAnswers: {
          $each: helpers.forEach({
            text: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          }),
        },
        explanation: { required },
      },
    };

    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => {
      emit('refresh');
    };

    const {
      updateCard,
      getError,
      saveTmp,
      addAnswer,
      updateTextAnswer,
      validateAnswerDeletion,
      errorMsg,
    } = useCardTemplate(card, v$, refreshCard);

    const disableAnswerCreation = computed(() => card.value.qcAnswers.length >= CHOICE_QUESTION_MAX_ANSWERS_COUNT ||
      disableEdition.value || cardParent.value.status === PUBLISHED);

    const disableAnswerDeletion = computed(() => card.value.qcAnswers.length <= CHOICE_QUESTION_MIN_ANSWERS_COUNT ||
      disableEdition.value || cardParent.value.status === PUBLISHED);

    const qcAnswerErrorMsg = (index) => {
      const validation = v$.value.card.qcAnswers.$each.$response.$errors[index].text;

      if (get(validation, '0.$validator') === 'required') return REQUIRED_LABEL;
      if (get(validation, '0.$validator') === 'maxLength') return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;

      return '';
    };

    const answerIsRequired = index => index < CHOICE_QUESTION_MIN_ANSWERS_COUNT;

    return {
      // Computed
      card,
      v$,
      disableAnswerCreation,
      disableAnswerDeletion,
      // Methods
      qcAnswerErrorMsg,
      answerIsRequired,
      updateCard,
      getError,
      saveTmp,
      addAnswer,
      updateTextAnswer,
      validateAnswerDeletion,
      errorMsg,
    };
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
