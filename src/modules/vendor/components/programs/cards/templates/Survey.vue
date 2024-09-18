<template>
  <div class="container">
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="v$.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <div class="checkbox-container">
      <q-checkbox v-model="card.isMandatory" @update:model-value="updateCard('isMandatory')" label="Réponse obligatoire"
        class="q-mb-lg" dense :disable="disableEdition" />
      <q-checkbox :model-value="displayAllLabels" @update:model-value="validateInitialization"
        label="Définir les légendes de chaque niveau" class="q-mb-lg" dense :disable="disableEdition" />
    </div>
    <div class="input-container" v-for="label in Object.keys(card.labels)" :key="label">
      <ni-input :caption="`Légende niveau ${label}`" v-model="card.labels[label]"
        @focus="saveTmp(`labels.${label}`)" @blur="updateCardLabels(label)" :error="v$.card.labels[label].$error"
        :error-message="labelErrorMessage(label)" :disable="disableEdition" required-field />
    </div>
  </div>
</template>

<script>
import { toRefs, computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, maxLength, requiredIf } from '@vuelidate/validators';
import Cards from '@api/Cards';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import Input from '@components/form/Input';
import { QUESTION_OR_TITLE_MAX_LENGTH } from '@data/constants';
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
        question: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
        labels: {
          1: { required },
          2: { required: requiredIf(displayAllLabels.value) },
          3: { required: requiredIf(displayAllLabels.value) },
          4: { required: requiredIf(displayAllLabels.value) },
          5: { required },
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

      return '';
    };

    const updateCardLabels = async (labelKey) => {
      try {
        if (tmpInput.value === get(card.value, `labels.${labelKey}`)) return;

        v$.value.card.labels.$touch();
        await Cards.updateById(card.value._id, { labels: card.value.labels });

        await refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    };

    const initializeLabels = async (labels, displayAllLabelsValue) => {
      try {
        await Cards.updateById(card.value._id, { labels });

        await refreshCard();
        displayAllLabels.value = displayAllLabelsValue;
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
      }
    };

    const validateInitialization = async (value) => {
      try {
        if (!value) {
          $q.dialog({
            title: 'Confirmation',
            message: 'Êtes-vous sûr(e) de vouloir définir moins de légendes&nbsp;? '
              + 'Les légendes des niveaux 2, 3 et 4 seront perdues.',
            ok: true,
            html: true,
            cancel: 'Annuler',
          }).onOk(() => initializeLabels({ 2: null, 3: null, 4: null }, value))
            .onCancel(() => NotifyPositive('Action annulée.'));
        } else {
          initializeLabels({ 2: '', 3: '', 4: '' }, value);
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
      validateInitialization,
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
