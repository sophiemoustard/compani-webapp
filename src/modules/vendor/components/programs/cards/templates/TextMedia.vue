<template>
  <div>
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-option-group v-model="selectedExtension" type="radio" :options="extensionOptions" inline />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" alt="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="$v.card.media.$error"
      :extensions="extensions" cloudinary-storage :additional-value="imageFileName" required-field
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" :disable="disableEdition" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import OptionGroup from '@components/form/OptionGroup';
import { UPLOAD_IMAGE, UPLOAD_VIDEO, UPLOAD_AUDIO, UPLOAD_EXTENSION_OPTIONS } from '@data/constants';

export default {
  name: 'TextMedia',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-option-group': OptionGroup,
  },
  mixins: [templateMixin],
  data () {
    return {
      selectedExtension: UPLOAD_IMAGE,
      extensionOptions: UPLOAD_EXTENSION_OPTIONS,
    };
  },
  computed: {
    extensions () {
      switch (this.selectedExtension) {
        case UPLOAD_VIDEO:
          return this.videoExtensions;
        case UPLOAD_AUDIO:
          return this.audioExtensions;
        default:
          return this.imageExtensions;
      }
    },
  },
  validations () {
    return {
      card: { text: { required }, media: { publicId: required, link: required } },
    };
  },
};
</script>

<style lang="stylus" scoped>
@media (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
