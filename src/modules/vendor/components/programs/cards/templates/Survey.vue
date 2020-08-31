<template>
  <div>
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" />
    <div class="row gutter-profile">
      <ni-input class="col-md-6 col-xs-12" caption="Label gauche" v-model.trim="card.label.left"
        @focus="saveTmp('label.left')" @blur="updateCardLabel('left')" :error="$v.card.label.left.$error"
        :error-message="labelErrorMessage('left')" />
      <ni-input class="col-md-6 col-xs-12" caption="Label droit" v-model.trim="card.label.right"
        @focus="saveTmp('label.right')" @blur="updateCardLabel('right')" :error="$v.card.label.right.$error"
        :error-message="labelErrorMessage('right')" />
    </div>
  </div>
</template>

<script>
import set from 'lodash/set';
import { required, requiredIf, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import Input from '@components/form/Input';
import { SURVEY_LABEL_MAX_LENGTH } from '@data/constants';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'Survey',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        question: { required },
        label: {
          left: { required: requiredIf(item => !!item.right), maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
          right: { required: requiredIf(item => !!item.left), maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
        },
      },
    };
  },
  methods: {
    labelErrorMessage (label) {
      if (!this.$v.card.label[label].required) return 'Les 2 labels doivent etre renseignés ou vides.';
      if (!this.$v.card.label[label].maxLength) return `${SURVEY_LABEL_MAX_LENGTH} caractères maximum.`;
    },
    async updateCardLabel (label) {
      try {
        const value = this.card.label[label];
        if (this.tmpInput === this.card.label[label]) return;

        this.$v.card.label.$touch();
        if (!this.$v.card.label[label].maxLength) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, set({}, `label.${label}`, value));

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
