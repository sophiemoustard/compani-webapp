<template>
  <div>
    <ni-input class="q-mb-lg" caption="Texte" v-model="card.gappedText" required-field
      @blur="updateCard('gappedText')" :error="$v.card.gappedText.$error" type="textarea" @focus="saveTmp('gappedText')"
      :error-message="gappedTextTagCodeErrorMsg" :disable="disableEdition" />
    <div class="q-mb-lg row gutter-profile answers">
      <ni-input v-for="(answer, i) in card.falsyGapAnswers" :key="i" class="col-xs-12 col-md-6" :required-field="i < 2"
        @blur="updateTextAnswer(i)" v-model="card.falsyGapAnswers[i].text"
        :caption="`Mot ${i + 1}`" :disable="disableEdition" @focus="saveTmp(`falsyGapAnswers[${i}].text`)"
        :error="$v.card.falsyGapAnswers.$each[i].text.$error" :error-message="falsyGapAnswersErrorMsg(i)" />
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { required, maxLength } from 'vuelidate/lib/validators';
import { REQUIRED_LABEL, GAP_ANSWER_MAX_LENGTH } from '@data/constants';
import {
  validTagging,
  validAnswerInTag,
  validCaractersTags,
  validTagLength,
  validTagsCount,
  validCaracters,
} from '@helpers/vuelidateCustomVal';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'FillTheGaps',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
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
  },
};
</script>

<style lang="stylus" scoped>

.answers
  > div
    padding-top: 0

</style>
