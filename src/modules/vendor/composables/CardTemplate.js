import { computed, ref } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Cards from '@api/Cards';
import { QUESTION_MAX_LENGTH, REQUIRED_LABEL } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

export const useCardTemplate = (card, v$, refreshCard) => {
  const tmpInput = ref('');

  const questionErrorMsg = computed(() => {
    if (get(v$.value, 'card.question.required.$response') === false) return REQUIRED_LABEL;
    if (get(v$.value, 'card.question.maxLength.$response') === false) {
      return `${QUESTION_MAX_LENGTH} caractères maximum.`;
    }

    return '';
  });

  const saveTmp = (path) => {
    tmpInput.value = get(card.value, path);
  };

  const updateCard = async (path) => {
    try {
      const value = get(card.value, path);
      if (tmpInput.value === value) return;

      const validation = get(v$.value.card, path);
      if (validation) {
        validation.$touch();
        if (validation.$error) return NotifyWarning('Champ(s) invalide(s)');
      }

      await Cards.updateById(card.value._id, set({}, path, typeof value === 'string' ? value.trim() : value));

      await refreshCard();
      NotifyPositive('Carte mise à jour.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la mise à jour de la carte.');
    }
  };

  return {
    // Data
    tmpInput,
    // Computed
    questionErrorMsg,
    // Methods
    refreshCard,
    saveTmp,
    updateCard,
  };
};
