<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
      class="q-mb-lg" dense :disable="disableEdition" />
    <div class="row gutter-profile">
      <ni-input class="col-md-6 col-xs-12" caption="Légende niveau 1" v-model="card.labels['1']"
        @focus="saveTmp('labels.1')" @blur="updateCardLabels('1')" :error="v$.card.labels['1'].$error"
        :error-message="labelErrorMessage('1')" :disable="disableEdition" />
      <ni-input class="col-md-6 col-xs-12" caption="Légende niveau 5" v-model="card.labels['5']"
        @focus="saveTmp('labels.5')" @blur="updateCardLabels('5')" :error="v$.card.labels['5'].$error"
        :error-message="labelErrorMessage('5')" :disable="disableEdition" />
    </div>
  </div>
</template>

<script>
import { toRefs, computed } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
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
  emits: ['refresh'],
  setup (props, { emit }) {
    const { disableEdition } = toRefs(props);

    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        labels: {
          1: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
          5: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
        },
      },
    }));
    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => {
      emit('refresh');
    };

    const { tmpInput, saveTmp, updateCard, questionErrorMsg } = useCardTemplate(card, v$, refreshCard);

    const labelErrorMessage = (labelKey) => {
      if (get(v$.value, `card.labels[${labelKey}].required.$response`) === false) {
        return 'Toutes les légendes doivent être renseignées.';
      }
      if (get(v$.value, `card.labels[${labelKey}].maxLength.$response`) === false) {
        return `${SURVEY_LABEL_MAX_LENGTH} caractères maximum.`;
      }

      return '';
    };

    const updateCardLabels = async (labelKey) => {
      try {
        if (tmpInput.value === get(card.value, `labels.${labelKey}`)) return;

        v$.value.card.labels.$touch();
        const atLeastOneLabelIsTooLong = Object.keys(card.value.labels)
          .some(labKey => get(v$.value, `card.labels.${labKey}.maxLength.$response`) === false);
        if (atLeastOneLabelIsTooLong) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(card.value._id, { labels: card.value.labels });

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
      updateCardLabels,
      questionErrorMsg,
      saveTmp,
      updateCard,
      get,
    };
  },
};
</script>
