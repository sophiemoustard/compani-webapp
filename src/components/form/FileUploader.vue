<template>
  <div class="margin-input full-width">
    <div v-if="displayCaption && displayUpload" class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <div v-if="document && document.driveId" class="row justify-between" style="background: white">
      <div class="doc-thumbnail">
        <ni-custom-img :driveId="document.driveId" :alt="alt" />
      </div>
      <div class="self-end doc-delete">
        <q-btn color="primary" round flat icon="delete" size="1rem" @click.native="deleteDocument" />
        <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(document.link)" />
      </div>
    </div>
    <q-field borderless v-if="(!document || !document.driveId) && displayUpload" :error="error"
      :error-message="errorLabel">
      <q-uploader flat :bordered="false" color="white" :label="label" :url="url" :headers="headers"
        text-color="black" class="full-width" @failed="failMsg" :form-fields="additionalFields"
        @uploaded="documentUploaded" auto-upload :accept="extensions" :field-name="name" :multiple="multiple"/>
    </q-field>
  </div>
</template>

<script>
import { Cookies, openURL } from 'quasar';

import CustomImg from './CustomImg';
import { NotifyNegative } from '../popup/notify';

export default {
  components: {
    'ni-custom-img': CustomImg,
  },
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: { type: String, default: 'file' },
    additionalValue: String,
    entity: Object,
    url: { type: String, default: '' },
    errorLabel: { type: String, default: 'Document requis' },
    displayUpload: { type: Boolean, default: true },
    displayCaption: { type: Boolean, default: true },
    disable: { type: Boolean, default: false },
    withBorders: { type: Boolean, default: false },
    extensions: { type: String, default: '' },
    requiredField: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    label: { type: String, default: 'Pas de document' },
  },
  data () {
    return {
      headers: [{ name: 'x-access-token', value: Cookies.get('alenvi_token') || '' }],
    }
  },
  methods: {
    deleteDocument () {
      this.$emit('delete');
    },
    documentUploaded ({ file, xhr }) {
      this.$emit('uploaded', { file, xhr });
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
    failMsg () {
      return NotifyNegative('Echec de l\'envoi du document');
    },
  },
  computed: {
    additionalFields () {
      return [{ name: 'fileName', value: this.additionalValue }];
    },
    document () {
      return this.$_.get(this.entity, this.path);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .border
    border: 1px solid $light-grey;
    border-radius: 3px;

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
      padding-top: 3px;

  /deep/ .q-uploader
    .q-uploader__list
      display: none
    .q-uploader__header-content
      border: 1px solid $light-grey
      border-radius: 3px
      height: 40px
      margin: 0
    .q-btn
      margin: 0
      padding: 0
    .col
      margin: 0
    .q-uploader__title
      font-weight: 400;
    .q-uploader__subtitle
      display: none
      height: 0
</style>
