<template>
  <div>
    <ni-input class="q-mb-lg" caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea"
      :error-message="textTagCodeError" />
    <div class="q-mb-lg row gutter-profile answers">
      <div class="col-12 q-mb-sm">Mauvaises Réponses :</div>
      <ni-input v-for="i in 6" :key="i" class="col-xs-12 col-md-6" :caption="`Réponse ${i}`"
        v-model.trim="card.answers[i - 1]" @focus="saveTmpAnswer(i - 1)" @blur="updateAnswer(i - 1)"
        :error="getAnswerError(i - 1)" :required-field="i < 3" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { REQUIRED_LABEL } from '@data/constants';
import get from 'lodash/get';

export default {
  name: 'FillTheGaps',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  computed: {
    textTagCodeError () {
      if (this.$v.card.text.required === false) return REQUIRED_LABEL;
      if (!this.$v.card.text.validTagging) {
        return 'Balisage non valide, la bonne syntaxe est : <trou>la réponse</trou>';
      }
      if (!this.$v.card.text.validLengthInner) {
        return 'Le nombre de caractères entre les balises doit être entre 1 et 15';
      }
      if (!this.$v.card.text.validCaractersInner) {
        return 'Caractère invalide détecté entre les balises, seuls les symboles - \' et ESPACE sont permis';
      }
      if (!this.$v.card.text.validNumberOfTags) {
        return 'Le nombre de couple de balises doit être de 1 ou 2';
      }
      return '';
    },
  },
  methods: {
    getAnswerError (index) {
      if (index < 2) return get(this.$v.card, `answers.$each[${index}].$error`) || false;
      return false;
    },
    saveTmp (path) {
      this.tmpInput = get(this.card, path);
    },
  },
};
</script>

<style lang="stylus" scoped>

.answers
  & > div
    font-size: small
  & > .col-md-6
    padding-top: 0

</style>
