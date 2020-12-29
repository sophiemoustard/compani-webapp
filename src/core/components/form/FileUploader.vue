<template>
  <div class="margin-input col-xs-12 col-md-6">
    <div v-if="displayCaption" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <div v-if="document && imageSource" class="row justify-between" style="background: white">
      <div class="doc-thumbnail">
        <ni-custom-img :image-source="imageSource" :alt="alt" />
      </div>
      <div class="self-end doc-delete">
        <q-btn color="primary" round flat icon="delete" size="1rem" :disable="disable" @click.native="deleteDocument" />
        <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(document.link)" />
      </div>
    </div>
    <q-field borderless v-else :error="error" :error-message="errorMessage">
      <q-uploader ref="uploader" flat :bordered="inModal" color="white" :label="label" :url="url" with-credentials
        text-color="black" @failed="failMsg" :form-fields="additionalFields" :max-file-size="maxFileSize"
        @uploaded="documentUploaded" auto-upload :accept="extensions" field-name="file" :multiple="multiple"
        @rejected="rejected" :disable="disable" @start="uploadStarted" @finish="uploadFinished" />
    </q-field>
  </div>
</template>

<script>
import { openURL } from 'quasar';
import get from 'lodash/get';
import CustomImg from '@components/form/CustomImg';
import { NotifyNegative } from '@components/popup/notify';
import { removeDiacritics } from '@helpers/utils';

export default {
  components: {
    'ni-custom-img': CustomImg,
  },
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    path: { type: String, default: '' },
    alt: { type: String, default: '' },
    name: { type: String, default: 'file' },
    additionalValue: { type: String, default: '' },
    entity: { type: Object, default: () => ({}) },
    url: { type: String, default: '' },
    errorMessage: { type: String, default: 'Document requis' },
    displayCaption: { type: Boolean, default: true },
    disable: { type: Boolean, default: false },
    inModal: { type: Boolean, default: false },
    extensions: { type: String, default: '' },
    requiredField: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    label: { type: String, default: 'Pas de document' },
    cloudinaryStorage: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 1000 * 1000 },
  },
  computed: {
    additionalFields () {
      const fields = [{ name: 'fileName', value: removeDiacritics(this.additionalValue) }];
      if (!this.cloudinaryStorage) fields.push({ name: 'type', value: this.name });
      return fields;
    },
    document () {
      return get(this.entity, this.path);
    },
    imageSource () {
      return this.cloudinaryStorage ? this.document.link : this.document.driveId;
    },
  },
  methods: {
    uploadStarted () {
      this.$emit('start');
    },
    uploadFinished () {
      this.$emit('finish');
    },
    deleteDocument () {
      this.$emit('delete');
    },
    documentUploaded ({ file, xhr }) {
      this.$emit('uploaded', { file, xhr });
    },
    goToUrl (url) {
      if (!this.cloudinaryStorage) url = `${url}?usp=sharing`;
      openURL(url);
    },
    failMsg () {
      return NotifyNegative('Echec de l\'envoi du document.');
    },
    rejected (errors) {
      for (const error of errors) {
        if (error.failedPropValidation === 'max-file-size') NotifyNegative('Fichier trop volumineux.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px

  /deep/ .q-field__control
    height: 40px
    min-height: 40px

  /deep/ .q-field__append
    display: none
  /deep/ .q-field__bottom
      color: $secondary
      padding-top: 3px

  /deep/ .q-uploader
    width: 100%
    &--bordered
      border: 1px solid $grey-300
    .q-uploader__list
      display: none
    .q-uploader__header-content
      border-radius: 3px
      height: 38px
      margin: 0
      .q-btn__content
        color: $grey-400
    .q-btn
      margin: 0
      padding: 0
    .col
      margin: 0
    .q-uploader__title
      font-weight: 400
      overflow: initial
    .q-uploader__subtitle
      display: none
      height: 0
    .q-uploader__header:before
      opacity:0

</style>
