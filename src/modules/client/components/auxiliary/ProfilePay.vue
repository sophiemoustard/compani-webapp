<template>
  <div>
    <div class="q-mb-xl">
      <div v-if="isCoach" class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
      </div>
      <ni-simple-table v-if="payDocuments.length !== 0 || payDocumentsLoading" :data="payDocuments" :columns="columns"
        v-model:pagination="pagination" row-key="name" :loading="payDocumentsLoading">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row justify-center table-actions">
                  <ni-button :disable="loading || !getDriveId(props.row)" icon="file_download"
                    @click="downloadDriveDoc(props.row)" />
                  <ni-button v-if="isCoach" icon="delete" :disable="loading"
                    @click="validatePayDocumentDeletion(payDocuments[getRowIndex(payDocuments, props.row)])" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <div v-else class="q-my-sm">
        <span class="no-document">Aucun document</span>
      </div>
      <q-btn v-if="isCoach" class="fixed fab-custom" no-caps rounded color="primary" icon="add"
        label="Ajouter un document" @click="documentUpload = true" :disable="payDocumentsLoading" />

      <!-- Document upload modal -->
      <pay-document-creation-modal v-model="documentUpload" :validations="v$.newPayDocument" @submit="createDocument"
        v-model:new-pay-document="newPayDocument" :loading="loading" @hide="resetNewPayDocument" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import PayDocuments from '@api/PayDocuments';
import GoogleDrive from '@api/GoogleDrive';
import SimpleTable from '@components/table/SimpleTable';
import Button from '@components/Button';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { PAY_DOCUMENT_NATURES, COACH_ROLES } from '@data/constants';
import { formatDate } from '@helpers/date';
import { formatDownloadName, formatIdentityAndDocType } from '@helpers/utils';
import { validationMixin } from '@mixins/validationMixin';
import PayDocumentCreationModal from 'src/modules/client/components/pay/PayDocumentCreationModal';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'ProfilePay',
  setup () { return { v$: useVuelidate() }; },
  mixins: [tableMixin, validationMixin],
  components: {
    'pay-document-creation-modal': PayDocumentCreationModal,
    'ni-simple-table': SimpleTable,
    'ni-button': Button,
  },
  data () {
    return {
      documentUpload: false,
      loading: false,
      newPayDocument: {
        nature: null,
        date: new Date().toISOString(),
        file: null,
      },
      formValid: false,
      payDocuments: [],
      payDocumentsLoading: false,
      columns: [
        {
          name: 'nature',
          label: 'Type',
          align: 'left',
          field: 'nature',
          format: value => this.documentNatureLabels[value],
        },
        { name: 'date', label: 'Date', align: 'left', field: 'date', format: formatDate },
        { name: 'actions', label: '', align: 'left', field: row => row },
      ],
      pagination: {
        sortBy: 'date',
        descending: true,
        rowsPerPage: 0,
      },
    };
  },
  validations () {
    return {
      newPayDocument: {
        nature: { required },
        file: { required, maxSize: file => !file || file.size < 5000000 },
      },
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ clientRole: 'main/getClientRole' }),
    documentNatureLabels () {
      const payDocumentNaturesKeyedByValue = keyBy(PAY_DOCUMENT_NATURES, 'value');

      return mapValues(payDocumentNaturesKeyedByValue, 'label');
    },
    userProfile () {
      return this.$store.getters['userProfile/getUserProfile'] || this.loggedUser;
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    driveFolder () {
      return get(this.userProfile, 'administrative.driveFolder.driveId');
    },
  },
  async mounted () {
    await this.getDocuments();
  },
  methods: {
    getDriveId (doc) {
      return get(doc, 'file.driveId') || false;
    },
    async downloadDriveDoc (doc) {
      if (this.loading) return;
      try {
        this.loading = true;
        const { identity } = this.userProfile;

        const docName = formatDownloadName(`${formatDate(doc.date)} ${formatIdentityAndDocType(identity, 'paie')}`);
        await GoogleDrive.downloadFileById(this.getDriveId(doc), docName);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    formatDocumentPayload () {
      const { file, nature, date } = this.newPayDocument;
      const form = new FormData();
      form.append('nature', nature);
      form.append('date', date);
      form.append('file', file);
      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('user', this.userProfile._id);

      return form;
    },
    resetNewPayDocument () {
      this.newPayDocument = { nature: null, date: new Date().toISOString(), file: null };
      this.v$.newPayDocument.$reset();
    },
    async createDocument () {
      if (!this.driveFolder) NotifyNegative('Dossier Google Drive manquant.');

      this.v$.newPayDocument.$touch();
      const isValid = await this.waitForFormValidation(this.v$.newPayDocument);
      if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

      this.loading = true;

      try {
        await PayDocuments.create(this.formatDocumentPayload());

        this.documentUpload = false;
        NotifyPositive('Document sauvegardé');

        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi du document');
      }

      this.loading = false;
    },
    async getDocuments () {
      try {
        this.payDocumentsLoading = true;
        this.payDocuments = await PayDocuments.list({ user: this.userProfile._id });
      } catch (e) {
        this.payDocuments = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des documents.');
      } finally {
        this.payDocumentsLoading = false;
      }
    },
    async deletePayDocument (payDocument) {
      try {
        await PayDocuments.remove(payDocument._id);
        NotifyPositive('Document supprimé');
        await this.getDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validatePayDocumentDeletion (payDocument) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deletePayDocument(payDocument))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>

<style lang="sass" scoped>
  .q-card
    background: white
    width: 100%
    margin-bottom: 20px
</style>
