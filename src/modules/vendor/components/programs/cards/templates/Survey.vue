<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <div class="checkbox-container">
      <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
        class="q-mb-lg" dense :disable="disableEdition" />
      <q-checkbox :model-value="displayAllLabels" @update:model-value="initializeCardLabels"
        label="Définir les légendes de chaque niveau" class="q-mb-lg" dense :disable="disableEdition" />
    </div>
    <div class="input-container">
      <ni-input class="input" caption="Légende niveau 1" v-model="card.labels['1']" @focus="saveTmp('labels.1')"
        @blur="updateCardLabels('1')" :error="v$.card.labels['1'].$error" :error-message="labelErrorMessage('1')"
        :disable="disableEdition" required-field />
      <template v-if="displayAllLabels">
        <ni-input caption="Légende niveau 2" v-model="card.labels['2']"
          @focus="saveTmp('labels.2')" @blur="updateCardLabels('2')" :error="v$.card.labels['2'].$error"
          :error-message="labelErrorMessage('2')" :disable="disableEdition" required-field />
        <ni-input caption="Légende niveau 3" v-model="card.labels['3']"
          @focus="saveTmp('labels.3')" @blur="updateCardLabels('3')" :error="v$.card.labels['3'].$error"
          :error-message="labelErrorMessage('3')" :disable="disableEdition" required-field />
        <ni-input v-if="displayAllLabels" caption="Légende niveau 4" v-model="card.labels['4']"
          @focus="saveTmp('labels.4')" @blur="updateCardLabels('4')" :error="v$.card.labels['4'].$error"
          :error-message="labelErrorMessage('4')" :disable="disableEdition" required-field />
      </template>
      <ni-input caption="Légende niveau 5" v-model="card.labels['5']" @focus="saveTmp('labels.5')"
        @blur="updateCardLabels('5')" :error="v$.card.labels['5'].$error" :error-message="labelErrorMessage('5')"
        :disable="disableEdition" required-field />
    </div>
  </div>
</template>

<script>
import { toRefs, computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
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
    const $q = useQuasar();

    const card = computed(() => $store.state.card.card);

    const displayAllLabels = ref(Object.keys(card.value.labels).length > 2);

    const rules = computed(() => ({
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        labels: {
          1: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
          2: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
          3: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
          4: { required, maxLength: maxLength(SURVEY_LABEL_MAX_LENGTH) },
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

    const setLabels = async (labels, displayAllLabelsValue) => {
      try {
        await Cards.updateById(card.value._id, { labels });

        await refreshCard();
        displayAllLabels.value = displayAllLabelsValue;
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
      }
    };

    const initializeCardLabels = async (value) => {
      try {
        if (!value) {
          $q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr(e) de vouloir définir moins de légendes&nbsp;? '
              + 'Les légendes des niveaux 2, 3 et 4 seront perdues.',
            ok: true,
            html: true,
            cancel: 'Annuler',
          }).onOk(() => setLabels({ 2: null, 3: null, 4: null }, value))
            .onCancel(() => NotifyPositive('Action annulée.'));
        } else {
          setLabels({ 2: '', 3: '', 4: '' }, value);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return {
      // Data
      disableEdition,
      v$,
      // Computed
      card,
      displayAllLabels,
      // Methods
      labelErrorMessage,
      updateCardLabels,
      questionErrorMsg,
      saveTmp,
      updateCard,
      get,
      initializeCardLabels,
    };
  },
};
</script>
<style lang="sass" scoped>
.container
  display: flex
  flex-direction: column

.checkbox-container
  grid-auto-flow: row
  display: grid
  grid-template-rows: auto
  @media screen and (min-width: 768px)
    grid-auto-rows: 1fr
    grid-template-columns: repeat(2, 1fr)

.input-container
  width: 80%
</style>
