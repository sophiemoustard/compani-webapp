import { mapState } from 'vuex';
import Cards from '@api/Cards';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';

export const cardMixin = {
  computed: {
    ...mapState('card', ['card']),
  },
  methods: {
    async refreshCard (path, value) {
      try {
        await this.$store.dispatch(path, value);
        const card = path.includes('questionnaire')
          ? this.questionnaire.cards.find(c => c._id === this.card._id)
          : this.activity.cards.find(c => c._id === this.card._id);
        this.$store.dispatch('card/fetchCard', card);
      } catch (e) {
        console.error(e);
      }
    },
    openCardCreationModal () {
      this.cardCreationModal = true;
    },
    validateCardDeletion (cardId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer cette carte ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCard(cardId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCard (cardId) {
      try {
        await Cards.deleteById(cardId);
        await this.refreshParent();
        this.$store.dispatch('card/resetCard');
        NotifyPositive('Carte supprimée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la carte.');
      }
    },
  },
};
