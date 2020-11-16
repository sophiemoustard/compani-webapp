import { mapState } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Cards from '@api/Cards';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { QUESTION_MAX_LENGTH, REQUIRED_LABEL } from '@data/constants';

export const templateMixin = {
  data () {
    return {
      tmpInput: '',
      imageExtensions: 'image/jpg, image/jpeg, image/png',
      videoExtensions: 'video/mp4, video/m4v, video/avi',
      audioExtensions: '.mp3',
      maxFileSize: 2000000,
    };
  },
  computed: {
    ...mapState('program', ['card', 'activity']),
    mediaFileName () {
      return this.card.title ? this.card.title.replace(/ /g, '_') : this.activity.name.replace(/ /g, '_');
    },
    mediaUploadUrl () {
      return `${process.env.API_HOSTNAME}/cards/${this.card._id}/upload`;
    },
    questionErrorMsg () {
      if (!this.$v.card.question.required) return REQUIRED_LABEL;
      if (!this.$v.card.question.maxLength) return `${QUESTION_MAX_LENGTH} caractères maximum.`;
      return '';
    },
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.card, path);
    },
    async updateCard (path) {
      try {
        const value = get(this.card, path);
        if (this.tmpInput === value) return;

        const validation = get(this.$v.card, path);
        if (validation) {
          validation.$touch();
          if (validation.$error) return NotifyWarning('Champ(s) invalide(s)');
        }

        await Cards.updateById(this.card._id, set({}, path, typeof value === 'string' ? value.trim() : value));

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async refreshCard () {
      try {
        await this.$store.dispatch('program/fetchActivity', { activityId: this.activity._id });
        const card = this.activity.cards.find(c => c._id === this.card._id);
        this.$store.dispatch('program/fetchCard', card);
      } catch (e) {
        console.error(e);
      }
    },
    async mediaUploaded () {
      try {
        await this.refreshCard();
        NotifyPositive('Média envoyé');
      } catch (e) {
        NotifyNegative('Erreur lors de l\'envoi du média');
      }
    },
    async deleteMedia () {
      try {
        if (get(this.card, 'media')) {
          await Cards.deleteMedia(this.card._id);

          await this.refreshCard();
          NotifyPositive('Média supprimé');
        } else NotifyNegative('Erreur lors de la suppression du média.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du média.');
      }
    },
    validateMediaDeletion (path) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce média ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteMedia(path))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
