<template>
  <div class="container">
    <ni-input class="q-mb-lg" caption="Texte" v-model="card.gappedText" required-field
      @blur="updateCard('gappedText')" :error="v$.card.gappedText.$error" type="textarea" @focus="saveTmp('gappedText')"
      :error-message="gappedTextTagCodeErrorMsg" :disable="disableEdition" />
    <q-checkbox v-model="card.canSwitchAnswers" @update:model-value="updateCard('canSwitchAnswers')"
      label="Réponses interchangeables" class="q-mb-lg" dense :disable="disableEdition" />
    <div class="row gutter-profile-x">
      <div v-for="(answer, i) in card.falsyGapAnswers" :key="i" class="col-md-6 col-xs-12 answers">
        <ni-input class="input" v-model="card.falsyGapAnswers[i].text" :disable="disableEdition"
          @blur="updateTextAnswer(i)" :caption="`Mot ${i + 1}`" @focus="saveTmp(`falsyGapAnswers[${i}].text`)"
          :error="getError('falsyGapAnswers', i)" :error-message="falsyGapAnswersErrorMsg(i)"
          :required-field="answerIsRequired(i)" />
        <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
      </div>
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
  GAP_ANSWER_MAX_LENGTH,
  PUBLISHED,
  FILL_THE_GAPS_MAX_ANSWERS_COUNT,
  FILL_THE_GAPS_MIN_ANSWERS_COUNT,
} from '@data/constants';
import {
  validTagging,
  validAnswerInTag,
  validCaractersTags,
  validTagLength,
  validTagsCount,
  validCaracters,
} from '@helpers/vuelidateCustomVal';
import Button from '@components/Button';
import { useCardTemplate } from '../../../../composables/CardTemplate';

export default {
  name: 'FillTheGaps',
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
        gappedText: { required, validTagging, validCaractersTags, validTagLength, validTagsCount, validAnswerInTag },
        falsyGapAnswers: {
          $each: helpers.forEach({
            text: { required, validCaracters, maxLength: maxLength(GAP_ANSWER_MAX_LENGTH) },
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
      addAnswer, updateTextAnswer,
      validateAnswerDeletion,
    } = useCardTemplate(card, v$, refreshCard);

    const gappedTextTagCodeErrorMsg = computed(() => {
      const modifiedText = v$.value.card.gappedText;
      if (get(modifiedText, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(modifiedText, 'validTagsCount.$response') === false) return 'Le nombre de trous doit être de 1 ou 2';
      if (get(modifiedText, 'validTagging.$response') === false) {
        return 'Balisage non valide, la bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (get(modifiedText, 'validAnswerInTag.$response') === false) {
        return 'Il ne doit pas y avoir d\'espace au début et à la fin de la réponse. '
          + 'La bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (get(modifiedText, 'validCaractersTags.$response') === false) {
        return 'Caractère invalide détecté entre les balises, seuls les symboles - \' et ESPACE sont permis';
      }
      if (get(modifiedText, 'validTagLength.$response') === false) {
        return 'Le nombre de caractères entre les balises doit être entre 1 et 15';
      }

      return '';
    });

    const disableAnswerCreation = computed(() => card.value.falsyGapAnswers.length >= FILL_THE_GAPS_MAX_ANSWERS_COUNT ||
        disableEdition.value || cardParent.value.status === PUBLISHED);

    const disableAnswerDeletion = computed(() => card.value.falsyGapAnswers.length <= FILL_THE_GAPS_MIN_ANSWERS_COUNT ||
        disableEdition.value || cardParent.value.status === PUBLISHED);

    const falsyGapAnswersErrorMsg = (index) => {
      const validation = v$.value.card.falsyGapAnswers.$each.$response.$errors[index].text;

      switch (get(validation, '0.$validator')) {
        case 'required':
          return REQUIRED_LABEL;
        case 'maxLength':
          return `${GAP_ANSWER_MAX_LENGTH} caractères maximum.`;
        case 'validCaracters':
          return 'Caractère invalide détecté (seuls - \' ESPACE permis)';
        default:
          return '';
      }
    };

    const answerIsRequired = index => index < FILL_THE_GAPS_MIN_ANSWERS_COUNT;

    return {
      // Validation
      v$,
      // Computed
      gappedTextTagCodeErrorMsg,
      disableAnswerCreation,
      disableAnswerDeletion,
      card,
      // Methods
      answerIsRequired,
      falsyGapAnswersErrorMsg,
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
  align-items: center
.input
  flex: 1
.add-button
  align-self: flex-end
</style>
