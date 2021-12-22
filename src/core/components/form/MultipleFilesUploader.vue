<template>
  <div>
    <template v-if="documents.length === 0">
      <div class="row gutter-profile">
        <div class="flex-1">
          <ni-file-uploader :path="path" @uploaded="documentUploaded" :name="name" :extensions="extensions"
            :user-profile="userProfile" :url="url" @delete="deleteDocument($event)" :caption="caption" :multiple="true"
            :additional-value="additionalFieldsName" label="Choisir un document" drive-storage />
        </div>
      </div>
    </template>
    <template v-if="documents && documents.length > 0">
      <div class="row" v-if="caption">
        <p class="input-caption">{{ caption }}</p>
      </div>
      <div class="row">
        <template v-for="(certificate, index) in documents">
          <div v-if="getDriveId(certificate)" class="row justify-between files-container" :key="index">
            <span class="document-caption">{{ caption }}</span>
            <div class="doc-actions">
              <ni-button icon="save_alt" :disabled="loading" @click.native="downloadDriveDoc(certificate)" />
              <ni-button icon="delete" :disabled="loading" @click.native="deleteDocument(certificate)" />
            </div>
          </div>
        </template>
      </div>
      <div class="row gutter-profile">
        <q-expansion-item v-model="collapsibleOpened" :label="collapsibleLabel" :expand-icon="collapsibleIcon"
          class="flex-1">
          <ni-file-uploader :path="path" @uploaded="documentUploaded" :name="name" :extensions="extensions"
            :user-profile="userProfile" :url="url" @delete="deleteDocument($event)" :caption="caption" :multiple="true"
            :additional-value="additionalFieldsName" label="Choisir un document" drive-storage />
        </q-expansion-item>
      </div>
    </template>
  </div>
</template>

<script>
import get from 'lodash/get';
import FileUploader from '@components/form/FileUploader';
import Button from '@components/Button';
import { NotifyNegative } from '@components/popup/notify';
import GoogleDrive from '@api/GoogleDrive';

export default {
  name: 'MultipleFilesUploader',
  components: {
    'ni-file-uploader': FileUploader,
    'ni-button': Button,
  },
  props: {
    caption: { type: String, default: '' },
    path: { type: String, default: '' },
    name: { type: String, default: '' },
    url: { type: String, default: '' },
    additionalFieldsName: { type: String, default: '' },
    userProfile: { type: Object, default: () => ({}) },
    collapsibleLabel: { type: String, default: '' },
    extensions: { type: String, default: '' },
  },
  data () {
    return {
      collapsibleOpened: false,
      loading: false,
    };
  },
  computed: {
    collapsibleIcon () {
      return !this.collapsibleOpened ? 'add' : 'mdi-close';
    },
    documents () {
      return get(this.userProfile, this.path) || [];
    },
  },
  methods: {
    deleteDocument (doc) {
      this.$emit('delete', this.getDriveId(doc));
    },
    documentUploaded (file) {
      this.$emit('uploaded');
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document.');
    },
    getDriveId (doc) {
      return get(doc, 'driveId') || '';
    },
    async downloadDriveDoc (doc) {
      try {
        this.loading = true;
        await GoogleDrive.downloadFileById(this.getDriveId(doc));
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.doc-actions
  .q-btn
    @media screen and (max-width: 767px)
      margin: 0px 4px

:deep .q-item__section--side
  .q-icon
    size: 1em
    color: $primary

.files-container
  width: 100%
  background-color: white
  align-items: center
  padding: 8px
  margin-bottom: 16px
</style>
