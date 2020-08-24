<template>
  <div v-if="answersInitialized">
    <ni-input class="q-mb-lg" caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" :error-message="textTagCodeErrorMsg" />
    <div class="q-mb-lg row gutter-profile answers">
      <ni-input v-for="(answer, i) in card.answers" :key="i" class="col-xs-12 col-md-6" :caption="`Mot ${i + 1}`"
        v-model.trim="card.answers[i].label" @focus="saveTmp(`answers[${i}].label`)" @blur="updateAnswer(i)"
        :error="answersError(i)" :required-field="i < 2" :error-message="answersErrorMsg(i)" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import times from 'lodash/times';
import get from 'lodash/get';
import Cards from '@api/Cards';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL, FILL_THE_GAPS_MAX_ANSWERS_COUNT } from '@data/constants';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'FillTheGaps',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  data () {
    return {
      answersCountInDb: 0,
    };
  },
  computed: {
    textTagCodeErrorMsg () {
      if (this.$v.card.text.required === false) return REQUIRED_LABEL;
      if (!this.$v.card.text.validTagsCount) {
        return 'Le nombre de couple de balises doit être de 1 ou 2';
      }
      if (!this.$v.card.text.validTagging) {
        return 'Balisage non valide, la bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (!this.$v.card.text.validAnswerInTag) {
        return 'Il ne doit pas y avoir d\'espace au début et à la fin de la réponse. '
          + 'La bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (!this.$v.card.text.validCaractersTags) {
        return 'Caractère invalide détecté entre les balises, seuls les symboles - \' et ESPACE sont permis';
      }
      if (!this.$v.card.text.validTagLength) {
        return 'Le nombre de caractères entre les balises doit être entre 1 et 15';
      }
      return '';
    },
    answersInitialized () {
      return this.card.answers.length === FILL_THE_GAPS_MAX_ANSWERS_COUNT;
    },
  },
  async mounted () {
    this.initializeAnswers();
  },
  watch: {
    card () {
      this.initializeAnswers();
    },
  },
  methods: {
    initializeAnswers () {
      this.answersCountInDb = this.card.answers.length;
      this.card.answers = times(FILL_THE_GAPS_MAX_ANSWERS_COUNT, i => this.card.answers[i] || ({ label: '' }));
    },
    answersError (index) {
      return this.$v.card.answers.$each[index].label.$error || this.requiredAnswerIsMissing(index);
    },
    answersErrorMsg (index) {
      if (!this.$v.card.answers.$each[index].label.validAnswerLength) {
        return 'Le nombre de caractères doit être entre 1 et 15';
      }
      if (!this.$v.card.answers.$each[index].label.validCaracters) {
        return 'Caractère invalide détecté (seuls - \' ESPACE permis)';
      }
      if (this.requiredAnswerIsMissing(index)) return REQUIRED_LABEL;
      return '';
    },
    requiredAnswerIsMissing (index) {
      return this.$v.card.answers.$error && !this.$v.card.answers.min2Answers && index < 2 &&
        this.card.answers.filter(a => !!a.label).length < this.answersCountInDb && !this.card.answers[index].label;
    },
    async updateAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `answers[${index}].label`)) return;

        this.$v.card.answers.$touch();
        if (this.$v.card.answers.$each[index].label.$error || this.requiredAnswerIsMissing(index)) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        await Cards.updateById(this.card._id, { answers: this.card.answers.filter(a => !!a.label) });

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
    padding-top: 0

</style>
