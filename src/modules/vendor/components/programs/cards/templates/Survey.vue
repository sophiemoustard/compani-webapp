<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
      class="q-mb-lg" dense :disable="disableEdition" />
    <div class="row gutter-profile">
      <ni-input class="col-md-6 col-xs-12" caption="Label gauche" v-model="card.label.left"
        @focus="saveTmp('label.left')" @blur="updateCardLabel('left')" :error="v$.card.label.left.$error"
        :error-message="labelErrorMessage('left')" :disable="disableEdition" />
      <ni-input class="col-md-6 col-xs-12" caption="Label droit" v-model="card.label.right"
        @focus="saveTmp('label.right')" @blur="updateCardLabel('right')" :error="v$.card.label.right.$error"
        :error-message="labelErrorMessage('right')" :disable="disableEdition" />
    </div>
  </div>
</template>

<script>
import { toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import set from 'lodash/set';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf, maxLength } from '@vuelidate/validators';
import Cards from '@api/Cards';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import Input from '@components/form/Input';
import { SURVEY_LABEL_MAX_LENGTH, QUESTION_MAX_LENGTH } from '@data/constants';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

export default {
  name: 'Survey',
  components: {
    'ni-input': Input,
  },
  setup (props, { emit }) {
    const { disableEdition } = toRefs(props);

    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        label: {
          left: {
            required: requiredIf(!!get(card.value, 'label.right')),
            maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH),
          },
          right: {
            required: requiredIf(!!get(card.value, 'label.left')),
            maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH),
          },
        },
      },
    }));
    const v$ = useVuelidate(rules, { card });

    const { tmpInput, refreshCard, saveTmp, updateCard, questionErrorMsg } = useCardTemplate(card, v$, emit);

    const labelErrorMessage = (label) => {
      if (get(v$.value, `card.label.${label}.required.$response`) === false) {
        return 'Les 2 labels doivent être renseignés ou vides.';
      }
      if (get(v$.value, `card.label[${label}].maxLength.$response`) === false) {
        return `${SURVEY_LABEL_MAX_LENGTH} caractères maximum.`;
      }

      return '';
    };

    const updateCardLabel = async (label) => {
      try {
        if (tmpInput.value === card.value.label[label]) return;

        v$.value.card.label.$touch();
        if (get(v$.value, `card.label[${label}].maxLength.$response`) === false) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        await Cards.updateById(card.value._id, set({}, `label.${label}`, card.value.label[label].trim()));

        await refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    };

    return {
      // Data
      disableEdition,
      v$,
      // Computed
      card,
      // Methods
      labelErrorMessage,
      updateCardLabel,
      questionErrorMsg,
      saveTmp,
      updateCard,
    };
  },
};
</script>
