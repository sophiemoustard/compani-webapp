<template>
  <div class="row" style="background: white">
    <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
      <croppa v-model="croppa" :canvas-color="canvasColor" accept="image/*" :initial-image="pictureLink"
        :prevent-white-space="true" placeholder="Cliquez ici pour choisir votre photo" placeholder-color="black"
        :placeholder-font-size="10" :show-remove-button="false" :disable-drag-and-drop="disablePictureEdition"
        :disable-drag-to-move="disablePictureEdition" :disable-scroll-to-zoom="disablePictureEdition"
        :disable-pinch-to-zoom="disablePictureEdition" @file-choose="choosePicture" />
    </div>
    <div class="row justify-center col-xs-12">
      <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat
        icon="mdi-square-edit-outline" size="1rem" @click="disablePictureEdition = false" />
      <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="delete" size="1rem"
        @click="validateImageDeletion" />
      <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="save_alt" size="1rem"
        type="a" :href="pictureDlLink(pictureLink)" target="_blank" />
      <q-btn v-if="!disablePictureEdition" color="primary" icon="close" @click="closePictureEdition" round flat
        size="1rem" />
      <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate_left" @click="croppa.rotate(-1)" round
        flat size="1rem" />
      <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate_right" @click="croppa.rotate(1)" round
        flat size="1rem" />
      <q-btn v-if="!disablePictureEdition" :loading="loadingImage" color="primary" icon="done"
        @click="uploadImage" round flat size="1rem" />
    </div>
    </div>
</template>

<script>
import 'vue-croppa/dist/vue-croppa.css';
import get from 'lodash/get';
import Users from '@api/Users';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { removeDiacritics } from '@helpers/utils';

export default {
  name: 'PictureUploader',
  props: {
    user: { type: Object, default: () => ({}) },
    refreshPicture: { type: Function, default: () => {} },
  },
  data () {
    return {
      disablePictureEdition: true,
      croppa: {},
      loadingImage: false,
      fileChosen: false,
    };
  },
  computed: {
    hasPicture () {
      return !!this.pictureLink;
    },
    pictureLink () {
      return get(this.user, 'picture.link') || null;
    },
    canvasColor () {
      return /\/ad\//.test(this.$route.path) ? '#FFEDDA' : '#EEE';
    },
    noDiacriticLastname () {
      return removeDiacritics(get(this.user, 'identity.lastname') || '');
    },
    noDiacriticFirstname () {
      return removeDiacritics(get(this.user, 'identity.firstname') || '');
    },
  },
  methods: {
    async formatImagePayload () {
      const blob = await this.croppa.promisedBlob('image/jpeg', 0.8);

      const data = new FormData();
      data.append('fileName', `photo_${this.noDiacriticFirstname}_${this.noDiacriticLastname}`);
      data.append('file', blob);

      return data;
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) await Users.deleteImage(this.user._id);

        this.loadingImage = true;
        const payload = await this.formatImagePayload();
        await Users.uploadImage(this.user._id, payload);

        await this.refreshPicture();
        this.closePictureEdition();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.loadingImage = false;
      }
    },
    async deleteImage () {
      try {
        if (get(this.user, 'picture.publicId')) {
          await Users.deleteImage(this.user._id);
          this.croppa.remove();

          await this.refreshPicture();
          NotifyPositive('Photo supprimée');
        } else NotifyNegative('Erreur lors de la suppression de la photo.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la photo.');
      }
    },
    validateImageDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer votre photo ?',
        ok: true,
        cancel: 'Annuler',
      })
        .onOk(this.deleteImage)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    choosePicture () {
      this.fileChosen = true;
      this.disablePictureEdition = false;
      this.croppa.chooseFile();
    },
    closePictureEdition () {
      this.disablePictureEdition = true;
      this.fileChosen = false;
      if (!this.hasPicture && !this.fileChosen) this.croppa.remove();
      if (this.hasPicture && !this.fileChosen) this.croppa.refresh();
    },
    pictureDlLink (link) {
      return link
        ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${this.noDiacriticFirstname}_${this.noDiacriticLastname}`)
        : '';
    },
  },
};
</script>
