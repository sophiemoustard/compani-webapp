<template>
  <div>
    <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" :disable="disableEdition" />
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-option-group v-model="card.media.type" :options="extensionOptions" inline @input="updateCard('media.type')"
       type="radio" :disable="isUploading || !!card.media.publicId" :error="$v.card.media.type.$error" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="$v.card.media.$error"
      :extensions="extensions" :additional-value="mediaFileName" required-field
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" :disable="disableEdition" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'TitleTextMedia',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-option-group': OptionGroup,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        title: { required },
        text: { required },
        media: { publicId: { required }, link: { required }, type: { required } },
      },
    };
  },
};
</script>

<style lang="stylus" scoped>
@media screen and (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
