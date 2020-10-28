<template>
  <div v-if="falsyGapAnswersInitialized">
    <ni-input class="q-mb-lg" caption="Texte" v-model="card.gappedText" required-field
      @blur="updateCard('gappedText')" :error="$v.card.gappedText.$error" type="textarea" @focus="saveTmp('gappedText')"
      :error-message="gappedTextTagCodeErrorMsg" :disable="disableEdition" />
    <div class="q-mb-lg row gutter-profile answers">
      <ni-input v-for="(answer, i) in card.falsyGapAnswers" :key="i" class="col-xs-12 col-md-6" :required-field="i < 2"
        @blur="updateFalsyGapAnswer(i)" v-model="card.falsyGapAnswers[i]" @focus="saveTmp(`falsyGapAnswers[${i}]`)"
        :caption="`Mot ${i + 1}`" :error="falsyGapAnswersError(i)" :error-message="falsyGapAnswersErrorMsg(i)"
        :disable="disableEdition" />
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import times from 'lodash/times';
import { required, maxLength } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import Cards from '@api/Cards';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL, FILL_THE_GAPS_MAX_ANSWERS_COUNT, GAP_ANSWER_MAX_LENGTH } from '@data/constants';
import {
  validTagging,
  validAnswerInTag,
  validCaractersTags,
  validTagLength,
  validTagsCount,
  validCaracters,
  minArrayLength,
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
          minLength: minArrayLength(2),
          $each: { validCaracters, maxLength: maxLength(GAP_ANSWER_MAX_LENGTH) },
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
    falsyGapAnswersInitialized () {
      return this.card.falsyGapAnswers.length === FILL_THE_GAPS_MAX_ANSWERS_COUNT;
    },
  },
  watch: {
    card: {
      handler: 'initializeFalsyGapAnswers',
      immediate: true,
    },
  },
  methods: {
    initializeFalsyGapAnswers () {
      this.card.falsyGapAnswers = times(FILL_THE_GAPS_MAX_ANSWERS_COUNT, i => this.card.falsyGapAnswers[i] || '');
    },
    falsyGapAnswersError (index) {
      return this.$v.card.falsyGapAnswers.$each[index].$error || this.requiredFalsyAnswerIsMissing(index);
    },
    falsyGapAnswersErrorMsg (index) {
      if (!this.$v.card.falsyGapAnswers.$each[index].maxLength) {
        return `${GAP_ANSWER_MAX_LENGTH} caractères maximum.`;
      }
      if (!this.$v.card.falsyGapAnswers.$each[index].validCaracters) {
        return 'Caractère invalide détecté (seuls - \' ESPACE permis)';
      }
      if (this.requiredFalsyAnswerIsMissing(index)) return REQUIRED_LABEL;

      return '';
    },
    requiredFalsyAnswerIsMissing (index) {
      return this.$v.card.falsyGapAnswers.$error && !this.$v.card.falsyGapAnswers.minLength && index < 2 &&
        !this.card.falsyGapAnswers[index];
    },
    formatFalsyGapAnswerPayload () {
      return this.card.falsyGapAnswers.filter(a => !!a).map(a => a.trim());
    },
    async updateFalsyGapAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `falsyGapAnswers[${index}]`)) return;

        this.$v.card.falsyGapAnswers.$touch();
        if (this.$v.card.falsyGapAnswers.$each[index].$error || this.requiredFalsyAnswerIsMissing(index)) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        await Cards.updateById(
          this.card._id, { falsyGapAnswers: this.formatFalsyGapAnswerPayload }
        );
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

<style lang="stylus" scoped>

.answers
  > div
    padding-top: 0

</style>
