import { NotifyPositive } from '@components/popup/notify';

export const cardMixin = {
  methods: {
    openCardCreationModal () {
      this.cardCreationModal = true;
    },
    validateCardDeletion (cardId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette carte ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCard(cardId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
