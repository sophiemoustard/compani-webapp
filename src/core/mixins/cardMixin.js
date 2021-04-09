import { mapState } from 'vuex';
import { NotifyPositive } from '@components/popup/notify';

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
  },
};
