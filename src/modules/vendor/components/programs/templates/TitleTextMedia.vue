<template>
  <div>
    <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" />
    <ni-input caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" alt="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="$v.card.media.$error"
      :extensions="extensions" cloudinaryStorage :additional-value="imageFileName" required-field
      :url="mediaUploadUrl" label="Pas de média" :maxFileSize="200000" />
  </div>
</template>

<script>
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import get from 'lodash/get';
import Cloudinary from '@api/Cloudinary';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader.vue';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleTextMedia',
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
  },
  data () {
    return {
      extensions: 'image/jpg, image/jpeg,, image/png',
    }
  },
  mixins: [templateMixin],
  computed: {
    imageFileName () {
      return this.card.title ? this.card.title.replace(/ /g, '_') : this.activity.name.replace(/ /g, '_');
    },
    mediaUploadUrl () {
      return `${process.env.API_HOSTNAME}/cards/${this.card._id}/cloudinary/upload`;
    },
  },
  methods: {
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
}
</script>

<style lang="stylus" scoped>
@media (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
