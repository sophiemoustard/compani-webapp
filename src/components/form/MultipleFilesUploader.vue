<template>
  <div>
    <div class="row" v-if="caption">
      <p class="input-caption">{{ caption }}</p>
    </div>
    <div v-if="documents.length === 0" class="row uploader-size">
        <ni-file-uploader path="financialCertificates" alt="justificatif financement" class="uploader-size"
          @uploaded="documentUploaded" name="financialCertificates" :user-profile="userProfile" :url="url"
          @delete="deleteDocument($event)" additional-value="financialCertificates" :multiple="true"
          label="Choisir un document"/>
    </div>
    <div class="row gutter-profile" v-if="documents && documents.length > 0">
      <div class="col-xs-12 col-md-6" v-for="(certificate, index) in documents" :key="index">
        <div v-if="certificate.driveId" class="justify-between row" style="background: white">
          <div class="doc-thumbnail">
            <ni-custom-img :driveId="certificate.driveId" :alt="alt" :key="certificate.driveId" />
          </div>
          <div class="self-end doc-delete">
            <q-btn color="primary" round flat icon="delete" size="1rem"
              @click.native="deleteDocument(certificate.driveId)" />
            <q-btn color="primary" round flat icon="save_alt" size="1rem" @click.native="goToUrl(certificate.link)" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="documents && documents.length > 0" class="row">
      <q-expansion-item v-model="collapsibleOpened" :label="collapsibleLabel" :expand-icon="collapsibleIcon"
        class="col-xs-12 col-md-6">
        <ni-file-uploader path="financialCertificates" alt="justificatif financement" class="uploader-size"
          @uploaded="documentUploaded" name="financialCertificates" :user-profile="userProfile" :url="url"
          @delete="deleteDocument($event)" additional-value="financialCertificates" :multiple="true"
          label="Choisir un document"/>
      </q-expansion-item>
    </div>
  </div>
</template>

<script>
import { openURL } from 'quasar';

import CustomImg from './CustomImg';
import { NotifyNegative } from '../popup/notify';
import FileUploader from '../../components/form/FileUploader.vue';

export default {
  name: 'MultipleFilesUploader',
  components: {
    'ni-custom-img': CustomImg,
    'ni-file-uploader': FileUploader,
  },
  props: {
    caption: String,
    error: { type: Boolean, default: false },
    path: String,
    alt: String,
    name: String,
    url: String,
    additionalFieldsName: String,
    userProfile: Object,
    collapsibleLabel: String,
  },
  data () {
    return {
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
      collapsibleOpened: false,
    };
  },
  computed: {
    collapsibleIcon () {
      return !this.collapsibleOpened ? 'add' : 'mdi-close';
    },
    documents () {
      return this.$_.get(this.userProfile, this.path) || [];
    },
  },
  methods: {
    deleteDocument (documentId) {
      this.$emit('delete', documentId);
    },
    documentUploaded (file) {
      this.$emit('uploaded');
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    goToUrl (url) {
      url = `${url}?usp=sharing`
      openURL(url);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
    .q-btn
      @media screen and (max-width: 767px)
        margin: 0px 5px

  /deep/ .q-uploader
    .q-uploader__header-content
      border: none !important

  @media screen and (min-width: 1025px)
    .uploader-size
      width: 50% !important

  /deep/ .q-expansion-item__toggle-icon
    color: $primary

</style>
