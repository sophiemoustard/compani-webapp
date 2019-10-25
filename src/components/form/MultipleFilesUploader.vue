<template>
  <div>
    <template v-if="documents.length === 0">
      <ni-file-uploader :path="path" alt="caption" @uploaded="documentUploaded" :name="name"
        :user-profile="userProfile" :url="url" @delete="deleteDocument($event)" :caption="caption"
        :additional-value="additionalFieldsName" :multiple="true" label="Choisir un document"/>
    </template>
    <template v-if="documents && documents.length > 0">
      <div class="row" v-if="caption">
        <p class="input-caption">{{ caption }}</p>
      </div>
      <div v-for="(certificate, index) in documents" :key="index">
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
    </template>
    <template v-if="documents && documents.length > 0">
      <q-expansion-item v-model="collapsibleOpened" :label="collapsibleLabel" :expand-icon="collapsibleIcon">
        <ni-file-uploader :path="path" alt="caption" @uploaded="documentUploaded" :name="name"
          :user-profile="userProfile" :url="url" @delete="deleteDocument($event)" :caption="caption"
          :additional-value="additionalFieldsName" :multiple="true" label="Choisir un document"/>
      </q-expansion-item>
    </template>
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
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    path: { type: String, default: '' },
    alt: { type: String, default: '' },
    name: { type: String, default: '' },
    url: { type: String, default: '' },
    additionalFieldsName: { type: String, default: '' },
    userProfile: { type: Object, default: () => {} },
    collapsibleLabel: { type: String, default: '' },
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
</style>
