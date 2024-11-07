import { NotifyPositive } from '@components/popup/notify';
import { useQuasar } from 'quasar';

export const useCards = (cardCreationModal, deleteCard) => {
  const $q = useQuasar();

  const openCardCreationModal = () => {
    cardCreationModal.value = true;
  };

  const validateCardDeletion = (cardId) => {
    $q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr(e) de vouloir supprimer cette carte&nbsp;?',
      html: true,
      ok: true,
      cancel: 'Annuler',
    }).onOk(() => deleteCard(cardId))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  return {
    // Methods
    openCardCreationModal,
    validateCardDeletion,
  };
};
