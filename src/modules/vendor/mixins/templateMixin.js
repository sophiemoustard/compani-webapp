import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Cards from '@api/Cards';
import Cloudinary from '@api/Cloudinary';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { TRANSITION, TITLE_TEXT_MEDIA, TITLE_TEXT, TEXT_MEDIA } from '@data/constants';

export const templateMixin = {
  data () {
    return {
      tmpInput: '',
      extensions: 'image/jpg, image/jpeg, image/png',
      maxFileSize: 2000000,
    };
  },
  validations () {
    switch (this.card.template) {
      case TRANSITION:
        return {
          card: { title: { required } },
        };
      case TITLE_TEXT_MEDIA:
        return {
          card: { title: { required }, text: { required }, media: { publicId: required, link: required } },
        };
      case TITLE_TEXT:
        return {
          card: { title: { required }, text: { required } },
        };
      case TEXT_MEDIA:
        return {
          card: { text: { required }, media: { publicId: required, link: required } },
        };
      default:
        return {};
    }
  },
  computed: {
    ...mapState('program', ['card', 'activity']),
    imageFileName () {
      return this.card.title ? this.card.title.replace(/ /g, '_') : this.activity.name.replace(/ /g, '_');
    },
    mediaUploadUrl () {
      return `${process.env.API_HOSTNAME}/cards/${this.card._id}/cloudinary/upload`;
    },
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.card, path);
    },
    async updateCard (path) {
      try {
        const value = get(this.card, path);
        if (this.tmpInput === value) return;

        get(this.$v.card, path).$touch();
        if (get(this.$v.card, path).$error) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, set({}, path, value));

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
        const card = this.activity.cards.find(card => card._id === this.card._id);
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
          await Cloudinary.deleteImageById({ id: this.card.media.publicId });
          await Cards.updateById(this.card._id, { media: { link: null, publicId: null } });

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
