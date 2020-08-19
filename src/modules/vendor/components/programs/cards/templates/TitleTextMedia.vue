<template>
  <div>
    <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="$v.card.title.$error" />
    <ni-input caption="Texte" v-model.trim="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="$v.card.text.$error" type="textarea" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" alt="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="$v.card.media.$error"
      :extensions="extensions" cloudinary-storage :additional-value="imageFileName" required-field
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'TitleTextMedia',
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
  },
  mixins: [templateMixin],
};
</script>

<style lang="stylus" scoped>
@media (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
