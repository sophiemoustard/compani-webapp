<template>
  <div>
    <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" />
    <ni-input caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" />
    <ni-file-uploader caption="Média" path="media" alt="media" :entity="card" name="media" :url="mediaUploadUrl"
      @uploaded="documentUploaded()" @delete="validateDocumentDeletion()" :error="$v.card.media.$error"
      :extensions="extensions" cloudinaryStorage :additional-value="imageFileName" required-field />
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
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  mixins: [templateMixin],
  computed: {
    imageFileName () {
      return 'Image-' + this.card.title.replace(/ /g, '_');
    },
    mediaUploadUrl () {
      return `${process.env.API_HOSTNAME}/cards/${this.card._id}/cloudinary/upload`;
    },
  },
  methods: {
    documentUploaded () {
      try {
        this.refreshCard();
        NotifyPositive('Document envoyé');
      } catch (e) {
        NotifyNegative('Erreur lors de la récupératino des informations');
      }
    },
    async deleteDocument () {
      try {
        if (get(this.card, 'media')) {
          await Cloudinary.deleteImageById({ id: this.card.media.publicId });
        }
        await Cards.updateById(this.card._id, { media: { link: null, publicId: null } });

        this.refreshCard();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateDocumentDeletion (path) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(path))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
}
</script>
