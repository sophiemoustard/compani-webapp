<template>
  <div class="row" style="background: white">
    <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
      <cropper v-if="showCropper" ref="cropper" :src="image" class="cropper" :stencil-props="{ aspectRatio: 1/1 }" />
      <ni-custom-img v-if="!showCropper && hasPicture" :image-source="pictureLink" alt="Photo de profil" />
      <ni-custom-img v-if="!showCropper && !hasPicture" :image-source="DEFAULT_AVATAR" alt="Photo par défaut" />
    </div>
    <div class="row justify-center col-xs-12">
      <div v-if="!showCropper && hasPicture">
        <q-btn color="primary" round flat icon="mdi-square-edit-outline" size="1rem" @click="showCropper = true" />
        <q-btn color="primary" round flat icon="delete" size="1rem" @click="validateImageDeletion" />
        <q-btn color="primary" round flat icon="save_alt" size="1rem" type="a" :href="pictureDlLink(pictureLink)"
          target="_blank" />
      </div>
      <div v-if="showCropper">
        <q-btn color="primary" round flat size="1rem" icon="close" @click="showCropper = false" />
        <q-btn color="primary" round flat size="1rem" icon="rotate_left" @click="() => rotate(-90)" />
        <q-btn color="primary" round flat size="1rem" icon="rotate_right" @click="() => rotate(90)" />
        <q-btn color="primary" round flat size="1rem" icon="done" @click="uploadImage" :loading="loadingImage" />
      </div>
      <input v-if="!showCropper && !hasPicture" type="file" ref="file" @change="loadImage($event)" accept="image/*"
        class="q-my-md">
    </div>
  </div>
</template>

<script>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import get from 'lodash/get';
import Users from '@api/Users';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import CustomImg from '@components/form/CustomImg';
import { DEFAULT_AVATAR } from '@data/constants';
import { removeDiacritics } from '@helpers/utils';

export default {
  name: 'PictureUploader',
  props: {
    user: { type: Object, default: () => ({}) },
    refreshPicture: { type: Function, default: () => {} },
  },
  components: {
    cropper: Cropper,
    'ni-custom-img': CustomImg,
  },
  data () {
    return {
      image: '',
      showCropper: false,
      loadingImage: false,
      fileChosen: false,
      DEFAULT_AVATAR,
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
  created () {
    this.image = get(this.user, 'picture.link') || '';
  },
  methods: {
    loadImage (event) {
      const { files } = event.target;

      if (files && files[0]) {
        if (this.image) URL.revokeObjectURL(this.image);

        const blob = URL.createObjectURL(files[0]);

        const reader = new FileReader();
        reader.onload = (e) => { this.image = blob; };
        reader.readAsArrayBuffer(files[0]);
        this.showCropper = true;
      }
    },
    rotate (angle) {
      this.$refs.cropper.rotate(angle);
    },
    async uploadImage () {
      const { canvas } = this.$refs.cropper.getResult();
      if (canvas) {
        await canvas.toBlob(
          async (blob) => {
            this.loadingImage = true;

            const data = new FormData();
            data.append('fileName', `photo_${this.noDiacriticFirstname}_${this.noDiacriticLastname}`);
            data.append('file', blob);

            await Users.uploadImage(this.user._id, data);
            await this.refreshPicture();

            this.showCropper = false;
            this.loadingImage = false;
          },
          'image/jpeg'
        );
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
    async deleteImage () {
      try {
        if (get(this.user, 'picture.publicId')) {
          await Users.deleteImage(this.user._id);
          this.image = '';

          await this.refreshPicture();

          NotifyPositive('Photo supprimée');
        } else NotifyNegative('Erreur lors de la suppression de la photo.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la photo.');
      }
    },
    pictureDlLink (link) {
      return link
        ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${this.noDiacriticFirstname}_${this.noDiacriticLastname}`)
        : '';
    },
  },
};
</script>

<style lang="sass" scoped>
.cropper
  height: 150px
  width: 150px
</style>
