<template>
  <div class="container">
    <ni-input class="q-mb-lg" caption="Texte" v-model="card.gappedText" required-field
      @blur="updateCard('gappedText')" :error="$v.card.gappedText.$error" type="textarea" @focus="saveTmp('gappedText')"
      :error-message="gappedTextTagCodeErrorMsg" :disable="disableEdition" />
    <q-checkbox v-model="card.canSwitchAnswers" @input="updateCard('canSwitchAnswers')"
      label="Réponses interchangeables" class="q-mb-lg" dense :disable="disableEdition" />
    <div class="row gutter-profile-x">
      <div v-for="(answer, i) in card.falsyGapAnswers" :key="i" class="col-md-6 col-xs-12 answers">
        <ni-input class="input" v-model="card.falsyGapAnswers[i].text" :disable="disableEdition"
          @blur="updateTextAnswer(i)" :caption="`Mot ${i + 1}`" @focus="saveTmp(`falsyGapAnswers[${i}].text`)"
          :error="$v.card.falsyGapAnswers.$each[i].text.$error" :error-message="falsyGapAnswersErrorMsg(i)"
          :required-field="answerIsRequired(i)" />
        <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
      </div>
    </div>
    <ni-button class="add-button q-mb-lg" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
      :disable="disableAnswerCreation" />
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { required, maxLength } from 'vuelidate/lib/validators';
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
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

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
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        gappedText: { required, validTagging, validCaractersTags, validTagLength, validTagsCount, validAnswerInTag },
        falsyGapAnswers: {
          $each: {
            text: { required, validCaracters, maxLength: maxLength(GAP_ANSWER_MAX_LENGTH) },
          },
        },
        explanation: { required },
      },
    };
  },
  computed: {
    gappedTextTagCodeErrorMsg () {
      if (this.$v.card.gappedText.required === false) return REQUIRED_LABEL;
      if (!this.$v.card.gappedText.validTagsCount) {
        return 'Le nombre de trous doit être de 1 ou 2';
      }
      if (!this.$v.card.gappedText.validTagging) {
        return 'Balisage non valide, la bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (!this.$v.card.gappedText.validAnswerInTag) {
        return 'Il ne doit pas y avoir d\'espace au début et à la fin de la réponse. '
          + 'La bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (!this.$v.card.gappedText.validCaractersTags) {
        return 'Caractère invalide détecté entre les balises, seuls les symboles - \' et ESPACE sont permis';
      }
      if (!this.$v.card.gappedText.validTagLength) {
        return 'Le nombre de caractères entre les balises doit être entre 1 et 15';
      }
      return '';
    },
    disableAnswerCreation () {
      return this.card.falsyGapAnswers.length >= FILL_THE_GAPS_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.falsyGapAnswers.length <= FILL_THE_GAPS_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
  },
  methods: {
    falsyGapAnswersErrorMsg (index) {
      if (!this.$v.card.falsyGapAnswers.$each[index].text.required) return REQUIRED_LABEL;
      if (!this.$v.card.falsyGapAnswers.$each[index].text.maxLength) {
        return `${GAP_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      if (!this.$v.card.falsyGapAnswers.$each[index].text.validCaracters) {
        return 'Caractère invalide détecté (seuls - \' ESPACE permis)';
      }

      return '';
    },
    answerIsRequired (index) {
      return index < FILL_THE_GAPS_MIN_ANSWERS_COUNT;
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
    align-items: center
  .input
    flex: 1
  .add-button
    align-self: flex-end
</style>
