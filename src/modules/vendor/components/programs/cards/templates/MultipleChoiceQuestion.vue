<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      type="textarea" :disable="disableEdition" class="q-mb-lg" />
    <div v-for="(qcAnswer, i) in card.qcAnswers" :key="i" class="answers">
      <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" class="input"
        @focus="saveTmp(`qcAnswers[${i}].text`)" @blur="updateTextAnswer(i)" :error-message="answersErrorMsg(i)"
        :error="getError('qcAnswers', i) || requiredOneCorrectAnswer(i)" :disable="disableEdition"
        :required-field="answerIsRequired(i)" />
      <q-checkbox v-model="card.qcAnswers[i].correct" @update:model-value="updateCorrectAnswer(i)"
        :disable="!card.qcAnswers[i].text || disableEdition" />
      <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="q-mb-lg add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
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
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import {
  REQUIRED_LABEL,
  QUESTION_OR_TITLE_MAX_LENGTH,
  QC_ANSWER_MAX_LENGTH,
  PUBLISHED,
  CHOICE_QUESTION_MAX_ANSWERS_COUNT,
  CHOICE_QUESTION_MIN_ANSWERS_COUNT,
} from '@data/constants';
import { minOneCorrectAnswer } from '@helpers/vuelidateCustomVal';
import Cards from '@api/Cards';
import Button from '@components/Button';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

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
  emits: ['refresh'],
  setup (props, { emit }) {
    const { disableEdition, cardParent } = toRefs(props);

    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        question: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
        qcAnswers: {
          minOneCorrectAnswer,
          $each: helpers.forEach({
            text: { required, maxLength: maxLength(QC_ANSWER_MAX_LENGTH) },
          }),
        },
        explanation: { required },
      },
    }));

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
      questionErrorMsg,
    } = useCardTemplate(card, v$, refreshCard);

    const disableAnswerCreation = computed(() => disableEdition.value || cardParent.value.status === PUBLISHED ||
      card.value.qcAnswers.length >= CHOICE_QUESTION_MAX_ANSWERS_COUNT);

    const disableAnswerDeletion = computed(() => disableEdition.value || cardParent.value.status === PUBLISHED ||
      card.value.qcAnswers.length <= CHOICE_QUESTION_MIN_ANSWERS_COUNT);

    const requiredOneCorrectAnswer = index => !get(v$.value, 'card.qcAnswers.minOneCorrectAnswer.$response') &&
      !!card.value.qcAnswers[index].text;

    const updateCorrectAnswer = async (index) => {
      try {
        const editedAnswer = get(card.value, `qcAnswers[${index}]`);

        await Cards.updateAnswer(
          { cardId: card.value._id, answerId: editedAnswer._id },
          { correct: editedAnswer.correct }
        );

        await refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    };

    const answersErrorMsg = (index) => {
      const validation = v$.value.card.qcAnswers.$each.$response.$errors[index].text;

      if (get(validation, '0.$validator') === 'required') return REQUIRED_LABEL;
      if (requiredOneCorrectAnswer(index)) return 'Une bonne réponse est nécessaire.';
      if (get(validation, '0.$validator') === 'maxLength') return `${QC_ANSWER_MAX_LENGTH} caractères maximum.`;

      return '';
    };

    const answerIsRequired = index => index < CHOICE_QUESTION_MIN_ANSWERS_COUNT;

    return {
      // Validations
      v$,
      // Computed
      card,
      disableAnswerCreation,
      disableAnswerDeletion,
      questionErrorMsg,
      // Methods
      requiredOneCorrectAnswer,
      updateCorrectAnswer,
      answersErrorMsg,
      answerIsRequired,
      updateCard,
      getError,
      saveTmp,
      addAnswer,
      updateTextAnswer,
      validateAnswerDeletion,
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
  flex-direction: row
.input
  flex: 1
.add-button
  align-self: flex-end
</style>
