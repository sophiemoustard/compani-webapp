<template>
  <div>
    <div class="q-mb-xl">
      <div v-if="isCoach" class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
      </div>
      <ni-large-table :data="payDocuments" :columns="columns" :pagination.sync="pagination" row-key="name">
        <template v-slot:body="{ props }">
          <q-tr :props="props">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row justify-center table-actions">
                  <q-btn flat round small color="primary" :disable="loading || !getLink(props.row)" class="q-mx-sm"
                    type="a" :href="getLink(props.row)" target="_blank" icon="file_download" />
                  <q-btn v-if="isCoach" flat round small color="primary" icon="delete" class="q-mx-sm"
                    :disable="loading"
                    @click="validatePayDocumentDeletion(payDocuments[getRowIndex(payDocuments, props.row)])">
                  </q-btn>
                </div>
              </template>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </ni-large-table>
      <div v-if="payDocuments.length === 0" class="q-px-md q-my-sm">
        <span class="no-document">Aucun document</span>
      </div>
      <q-btn v-if="isCoach" class="fixed fab-custom" no-caps rounded color="primary" icon="add"
        label="Ajouter un document" @click="documentUpload = true" :disable="loading" />

      <!-- Document upload modal -->
      <ni-modal v-model="documentUpload">
        <template slot="title">
          Ajouter un <span class="text-weight-bold">document</span>
        </template>
        <ni-document-upload inModal :natureOptions="documentNatureOptions" v-model="newDocument"
          ref="documentUploadForm" @valid="formValid = $event">
        </ni-document-upload>
        <template slot="footer">
          <q-btn no-caps class="full-width modal-btn" label="Ajouter le document" icon-right="add" color="primary"
            :loading="loading" @click="createDocument" />
        </template>
      </ni-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import snakeCase from 'lodash/snakeCase';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';
import { PAY_DOCUMENT_NATURES, OTHER, AUXILIARY_ROLES, COACH_ROLES } from '../../data/constants';
import Modal from '../../components/Modal';
import LargeTable from '../../components/table/LargeTable';
import DocumentUpload from '../../components/documents/DocumentUpload';
import PayDocuments from '../../api/PayDocuments';
import { formatIdentity } from '../../helpers/utils';
import { tableMixin } from '../../mixins/tableMixin';

export default {
  name: 'ProfilePay',
  mixins: [tableMixin],
  components: {
    'ni-document-upload': DocumentUpload,
    'ni-modal': Modal,
    'ni-large-table': LargeTable,
  },
  data () {
    return {
      documentUpload: false,
      documentNatureOptions: PAY_DOCUMENT_NATURES,
      loading: false,
      newDocument: null,
      formValid: false,
      payDocuments: [],
      columns: [
        {
          name: 'nature',
          label: 'Type',
          align: 'left',
          field: 'nature',
          format: value => this.documentNatureLabels[value],
        },
        {
          name: 'date',
          label: 'Date',
          align: 'left',
          field: 'date',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: row => row,
        },
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        rowsPerPage: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
    }),
    documentNatureLabels () {
      const payDocumentNaturesKeyedByValue = keyBy(PAY_DOCUMENT_NATURES, 'value');

      return mapValues(payDocumentNaturesKeyedByValue, 'label');
    },
    userProfile () {
      if (AUXILIARY_ROLES.includes(this.mainUser.role.name)) return this.mainUser;
      if (COACH_ROLES.includes(this.mainUser.role.name)) return this.$store.getters['rh/getUserProfile'];
      else return {};
    },
    isCoach () {
      return COACH_ROLES.includes(this.mainUser.role.name);
    },
    driveFolder () {
      return get(this.userProfile, 'administrative.driveFolder.driveId');
    },
  },
  async mounted () {
    await this.getDocuments();
  },
  methods: {
    getLink (doc) {
      return get(doc, 'file.link') || false;
    },
    formatDocumentPayload () {
      const { file, nature, date } = this.newDocument;
      const form = new FormData();
      const formattedDate = this.$moment(date).format('DD-MM-YYYY-HHmm');
      const documentOption = this.documentNatureOptions.find(option => option.value === this.newDocument.nature);
      const fileName = documentOption && this.newDocument.nature !== OTHER
        ? snakeCase(`${documentOption.label} ${formattedDate} ${formatIdentity(this.userProfile.identity, 'FL')}`)
        : snakeCase(`document_paie_${formattedDate}`);

      form.append('nature', nature);
      form.append('date', date);
      form.append('payDoc', file);
      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('fileName', fileName);
      form.append('driveFolderId', this.driveFolder);
      form.append('user', this.userProfile._id);

      return form;
    },
    async createDocument () {
      if (!this.driveFolder) NotifyNegative('Dossier Google Drive manquant.')
      const isValid = await this.$refs.documentUploadForm.validate();
      if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

      this.loading = true;

      try {
        await PayDocuments.create(this.formatDocumentPayload());

        this.documentUpload = false;
        NotifyPositive('Document sauvegardé');

        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de l'envoi du document");
      }

      this.loading = false;
    },
    async getDocuments () {
      try {
        this.payDocuments = await PayDocuments.list({ user: this.userProfile._id });
      } catch (e) {
        this.payDocuments = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des documents');
      }
    },
    async deletePayDocument (payDocument) {
      try {
        await PayDocuments.remove(payDocument._id);
        NotifyPositive('Document supprimé');
        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    validatePayDocumentDeletion (payDocument) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deletePayDocument(payDocument))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-card
    background: white;
    width: 100%;
    margin-bottom: 20px;
</style>
