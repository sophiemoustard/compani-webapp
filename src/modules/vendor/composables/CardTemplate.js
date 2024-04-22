import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import set from 'lodash/set';
import Cards from '@api/Cards';
import { QUESTION_MAX_LENGTH, REQUIRED_LABEL } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import {
  FILL_THE_GAPS,
  MULTIPLE_CHOICE_QUESTION,
  ORDER_THE_SEQUENCE,
  QUESTION_ANSWER,
  SINGLE_CHOICE_QUESTION,
} from '../../../core/data/constants';

export const useCardTemplate = (card, v$, refreshCard) => {
  const tmpInput = ref('');
  const $q = useQuasar();

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

  const getError = (path, index) => !!get(v$.value, `card.${path}.$dirty`) &&
    get(v$.value, `card.${path}.$each.$response.$errors[${index}].text.0.$response`) === false;

  const getAnswerKeyToUpdate = (template) => {
    if ([MULTIPLE_CHOICE_QUESTION, SINGLE_CHOICE_QUESTION, QUESTION_ANSWER].includes(template)) return 'qcAnswers';
    if (template === ORDER_THE_SEQUENCE) return 'orderedAnswers';
    if (template === FILL_THE_GAPS) return 'falsyGapAnswers';

    return '';
  };

  const updateTextAnswer = async (index) => {
    try {
      const key = getAnswerKeyToUpdate(card.value.template);
      const editedAnswer = get(card.value, `${key}[${index}]`);

      if (tmpInput.value === editedAnswer.text) return;

      get(v$.value, `card.${key}`).$touch();
      const validation = get(v$.value, `card.${key}.$each.$response.$errors[${index}].text.0.$response`);
      if (validation === false) return NotifyWarning('Champ(s) invalide(s).');

      await Cards.updateAnswer(
        { cardId: card.value._id, answerId: editedAnswer._id },
        { text: editedAnswer.text.trim() }
      );

      await refreshCard();
      NotifyPositive('Carte mise à jour.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la mise à jour de la carte.');
    }
  };

  const addAnswer = async () => {
    try {
      await Cards.addAnswer(card.value._id);
      await refreshCard();

      NotifyPositive('Réponse ajoutée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'ajout de la réponse.');
    }
  };

  const validateAnswerDeletion = (index) => {
    $q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr(e) de vouloir supprimer cette réponse&nbsp;?',
      html: true,
      ok: true,
      cancel: 'Annuler',
    }).onOk(() => deleteAnswer(index))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  const deleteAnswer = async (index) => {
    try {
      const key = getAnswerKeyToUpdate(card.value.template);
      const answerId = get(card.value, `${key}[${index}]._id`);
      if (!answerId) return;

      await Cards.deleteAnswer({ cardId: card.value._id, answerId });

      await refreshCard();
      NotifyPositive('Réponse supprimée avec succès.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la suppression de la réponse.');
    }
  };

  return {
    // Data
    tmpInput,
    // Computed
    questionErrorMsg,
    // Methods
    saveTmp,
    updateCard,
    getError,
    updateTextAnswer,
    addAnswer,
    validateAnswerDeletion,
  };
};
