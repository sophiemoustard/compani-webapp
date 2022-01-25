<template>
  <div class="row" style="background: white">
    <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
      <cropper v-if="displayCropper" ref="cropper" :src="image" class="cropper" :stencil-props="{ aspectRatio: 1/1 }" />
      <ni-custom-img v-if="!displayCropper && hasPicture" :image-source="pictureLink" alt="Photo de profil" />
      <ni-custom-img v-if="!displayCropper && !hasPicture" :image-source="DEFAULT_AVATAR" alt="Photo par défaut" />
    </div>
    <div class="row justify-center col-xs-12">
      <div v-if="!displayCropper && hasPicture">
        <ni-button icon="mdi-square-edit-outline" size="1rem" @click="displayCropper = true" />
        <ni-button icon="delete" size="1rem" @click="validateImageDeletion" />
        <ni-button icon="save_alt" size="1rem" type="a" :href="pictureDlLink(pictureLink)" />
      </div>
      <div v-if="displayCropper">
        <ni-button size="1rem" icon="close" @click="displayCropper = false" />
        <ni-button size="1rem" icon="rotate_left" @click="() => rotate(-90)" />
        <ni-button size="1rem" icon="rotate_right" @click="() => rotate(90)" />
        <ni-button size="1rem" icon="done" @click="uploadImage" :loading="loadingImage" />
      </div>
      <div v-if="!displayCropper && !hasPicture" class="row input-file-container" @click="openFileSelection">
        <span class="input-file-empty">Ajouter une photo</span>
        <i aria-hidden="true" class="q-icon on-right material-icons self-center relative-position">
          add
          <input ref="file" type="file" class="input-file absolute-full cursor-pointer" accept="image/*"
            @change="loadImage($event)">
        </i>
      </div>
    </div>
  </div>
</template>

<script>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import get from 'lodash/get';
import Users from '@api/Users';
import Button from '@components/Button';
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
    'ni-button': Button,
  },
  data () {
    return {
      image: '',
      displayCropper: false,
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
    openFileSelection () {
      this.$refs.file.click();
    },
    loadImage (event) {
      const { files } = event.target;

      if (files && files[0]) {
        if (this.image) URL.revokeObjectURL(this.image);

        const blob = URL.createObjectURL(files[0]);

        const reader = new FileReader();
        reader.onload = (e) => { this.image = blob; };
        reader.readAsArrayBuffer(files[0]);
        this.displayCropper = true;
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

            this.displayCropper = false;
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

.input-file-container
  padding: 6px 10px
  color: $copper-500
  cursor: pointer
  .input-file-empty
    font-size: 14px
  .input-file
    opacity: 0
    max-width: 100%
    height: 100%
    width: 100%
    font-size: 0
</style>
