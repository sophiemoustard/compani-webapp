<template>
  <div>
    <q-card v-for="(contract, contractIndex) in sortedContracts" :key="contractIndex" class="contract-card">
      <q-card-section class="card-title" :style="{ color: cardTitle(contract.endDate).color }">
        {{ cardTitle(contract.endDate).msg }}
      </q-card-section>
      <p v-if="contract.status === CUSTOMER_CONTRACT && personKey !== CUSTOMER" class="card-subtitle">
        Statut : {{ getContractStatus(contract) }} - Bénéficiaire : {{ contract.customer.identity | formatIdentity('FL') }}
      </p>
      <p v-if="contract.status === CUSTOMER_CONTRACT && personKey === CUSTOMER" class="card-subtitle">
        Statut : {{ getContractStatus(contract) }} - Auxiliaire : {{ contract.user.identity | formatIdentity('FL') }}
      </p>
      <p v-if="contract.status === COMPANY_CONTRACT" class="card-subtitle">
        Statut : {{ getContractStatus(contract) }}
      </p>
      <ni-responsive-table :data="contract.versions" :columns="contractColumns" row-key="name"
        :pagination.sync="pagination" :visible-columns="visibleColumns(contract)">
        <template v-slot:body="{ props }" >
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'contractEmpty'">
                <div class="row justify-center table-actions">
                  <q-btn flat round small color="primary" @click="dlTemplate(props.row, contract, contractIndex)" icon="file_download"
                    :disable="!canDownload(props.row, contract.status, contractIndex)" />
                </div>
              </template>
              <template v-if="col.name === 'contractSigned'">
                <div v-if="hasToBeSignedOnline(props.row) && shouldSignDocument(contract.status, props.row.signature)">
                  <q-btn v-if="!props.row.endDate" no-caps small color="primary" label="Signer"
                  @click="openSignatureModal(props.row.signature.eversignId)" />
                </div>
                <div v-else-if="!getContractLink(props.row) && displayUploader && !hasToBeSignedOnline(props.row)"
                  class="row justify-center table-actions">
                  <q-uploader flat :url="docsUploadUrl(contract._id)" :headers="headers"
                    :form-fields="getFormFields(contract, props.row)" field-name="file" :accept="extensions"
                    auto-upload @uploaded="refresh" @fail="failMsg" />
                </div>
                <div v-else-if="getContractLink(props.row)" class="row justify-center table-actions">
                  <q-btn flat round small color="primary" type="a" :href="getContractLink(props.row)" target="_blank"
                    icon="file_download" />
                </div>
                <div v-else-if="hasToBeSignedOnline(props.row)" class="row justify-center table-actions">
                  <p class="no-margin">En attente de signature</p>
                </div>
              </template>
              <template v-else-if="col.name === 'archives'">
                <div class="row archives justify-center">
                  <div v-for="archive in col.value" :key="archive._id">
                    <q-btn flat round small color="primary" type="a" :href="getArchiveLink(archive)" target="_blank"
                      icon="file_download" :disable="getArchiveLink(archive)" />
                  </div>
                </div>
              </template>
              <template v-else-if="col.name === 'actions'">
                <div v-if="!contract.endDate" class="row no-wrap table-actions contract-actions">
                  <q-btn flat round small color="grey" icon="edit" @click="openVersionEdition(contract, props.row)" />
                  <q-btn v-if="!props.row.endDate" flat round small color="grey" icon="delete"
                    :disable="!props.row.canBeDeleted" @click="deleteVersion(contract._id, props.row._id)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <template v-if="displayActions && !contract.endDate">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un avenant"
            @click="openVersionCreation(contract)" />
          <q-btn flat no-caps color="grey-6" icon="clear" label="Mettre fin au contrat"
            @click="openEndContract(contract)" />
        </template>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="esignModal" @hide="refreshWithTimeout" full-height full-width>
      <q-card class="full-height" style="width: 80vw">
        <q-card-section class="row justify-end">
          <q-icon class="cursor-pointer" name="clear" size="1.5rem" @click.native="esignModal = false" />
        </q-card-section>
        <q-card-section class="full-height">
          <iframe :src="embeddedUrl" frameborder="0" class="iframe-normal"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import esign from '@api/Esign.js';
import { NotifyNegative } from '@components/popup/notify.js';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { downloadDocxFile } from '@helpers/file';
import { formatIdentity } from '@helpers/utils';
import { CONTRACT_STATUS_OPTIONS, CUSTOMER_CONTRACT, COACH, CUSTOMER, AUXILIARY, COMPANY_CONTRACT } from '@data/constants.js';
import { generateContractFields } from 'src/modules/client/helpers/generateContractFields';
import { tableMixin } from 'src/modules/client/mixins/tableMixin.js';
import { contractMixin } from 'src/modules/client/mixins/contractMixin.js';

export default {
  name: 'ContractsCard',
  mixins: [contractMixin, tableMixin],
  components: {
    'ni-responsive-table': ResponsiveTable,
  },
  props: {
    user: { type: Object, default: () => null },
    contracts: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    displayActions: { type: Boolean, default: () => false },
    displayUploader: { type: Boolean, default: () => false },
    personKey: { type: String, default: () => COACH },
  },
  data () {
    return {
      CUSTOMER_CONTRACT,
      COMPANY_CONTRACT,
      CUSTOMER,
      esignModal: false,
      embeddedUrl: '',
      loading: false,
      pagination: { rowsPerPage: 0 },
      contractColumns: [
        {
          name: 'weeklyHours',
          label: 'Volume horaire hebdomadaire',
          align: 'center',
          field: 'weeklyHours',
        },
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          align: 'left',
          field: 'endDate',
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : '∞',
        },
        {
          name: 'grossHourlyRate',
          label: 'Taux horaire',
          align: 'center',
          field: 'grossHourlyRate',
        },
        {
          name: 'contractEmpty',
          label: 'Word',
          align: 'center',
          field: 'contractEmpty',
        },
        {
          name: 'contractSigned',
          label: 'Contrat / Avenant',
          align: 'center',
          field: (val) => val.signature ? val.signature.eversignId : '',
        },
        {
          name: 'archives',
          label: 'Archives',
          align: 'center',
          field: 'auxiliaryArchives',
        },
        {
          name: 'actions',
          align: 'center',
          field: '_id',
        },
      ],
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  computed: {
    sortedContracts () {
      const contracts = this.contracts;
      return contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    },
    headers () {
      return [{ name: 'x-access-token', value: Cookies.get('alenvi_token') || '' }];
    },
  },
  methods: {
    cardTitle (contractEndDate) {
      if (!contractEndDate) return { msg: 'Contrat en cours', color: 'green' };

      if (this.$moment().isBefore(contractEndDate)) {
        return {
          msg: `Le contrat se termine le ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'orange',
        }
      } else {
        return {
          msg: `Contrat terminé le: ${this.$moment(contractEndDate).format('DD MMMM YYYY')}`,
          color: 'red',
        }
      }
    },
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    getFormFields (contract, version) {
      const formFields = [
        { name: 'fileName', value: `contrat_signe_${this.user.identity.firstname}_${this.user.identity.lastname}` },
        { name: 'contractId', value: contract._id },
        { name: 'versionId', value: version._id },
        { name: 'status', value: contract.status },
        { name: 'type', value: 'signedContract' },
      ];

      if (contract.status === CUSTOMER_CONTRACT) formFields.push({ name: 'customer', value: contract.customer._id });

      return formFields;
    },
    getLastVersion (contract) {
      return this.$_.orderBy(contract.versions, ['startDate'], ['desc'])[0];
    },
    visibleColumns (contract) {
      if (contract.status === CUSTOMER_CONTRACT) return this.columns.filter(col => col !== 'weeklyHours');
      return this.columns;
    },
    getContractStatus (contract) {
      return CONTRACT_STATUS_OPTIONS.find(status => status.value === contract.status).label;
    },
    openVersionCreation (contract) {
      this.$emit('openVersionCreation', contract);
    },
    openVersionEdition (contract, version) {
      this.$emit('openVersionEdition', { contract, version });
    },
    deleteVersion (contractId, versionId) {
      this.$emit('deleteVersion', { contractId, versionId });
    },
    openEndContract (contract) {
      this.$emit('openEndContract', contract);
    },
    refresh () {
      this.$emit('refresh');
    },
    refreshWithTimeout () {
      this.$emit('refreshWithTimeout');
    },
    getArchiveLink (archive) {
      return archive.link || false;
    },
    // Documents
    canDownload (version, status, contractIndex) {
      if (!this.user.company || !this.user.company.rhConfig || !this.user.company.rhConfig.templates) return false;

      const templates = this.user.company.rhConfig.templates;
      const versionIndex = this.getRowIndex(this.sortedContracts[contractIndex].versions, version);
      if (status === COMPANY_CONTRACT) {
        if (versionIndex === 0) return !!templates.contractWithCompany && !!templates.contractWithCompany.driveId;
        return !!templates.contractWithCompanyVersion && !!templates.contractWithCompanyVersion.driveId;
      }

      if (versionIndex === 0) return !!templates.contractWithCustomer && !!templates.contractWithCustomer.driveId;
      return !!templates.contractWithCustomerVersion && !!templates.contractWithCustomerVersion.driveId;
    },
    docsUploadUrl (contractId) {
      const driveId = this.$_.get(this.user, 'administrative.driveFolder.driveId');
      if (!driveId) return '';

      return `${process.env.API_HOSTNAME}/contracts/${contractId}/gdrive/${driveId}/upload`;
    },
    async dlTemplate (contractVersion, parentContract, contractIndex) {
      try {
        const data = generateContractFields(parentContract.status, { user: this.user, contract: contractVersion, initialContractStartDate: parentContract.startDate });
        if (!this.canDownload(contractVersion, parentContract.status, contractIndex)) return NotifyNegative('Impossible de télécharger le contrat.');

        const versionIndex = this.getRowIndex(this.sortedContracts[contractIndex].versions, contractVersion);
        const params = {
          driveId: versionIndex === 0 ? this.user.company.rhConfig.templates.contractWithCompany.driveId : this.user.company.rhConfig.templates.contractWithCompanyVersion.driveId,
        };

        await downloadDocxFile(params, data, 'contrat.docx');
      } catch (e) {
        console.error(e);
      }
    },
    async openSignatureModal (eversignId) {
      try {
        this.$q.loading.show();
        const document = await esign.getDocument(eversignId);
        const id = this.personKey === AUXILIARY ? 1 : 2;
        this.embeddedUrl = document.signers.find(signer => signer.id === id).embedded_signing_url;
        if (this.$q.platform.is.mobile) {
          window.location.href = this.embeddedUrl;
        } else {
          this.esignModal = true;
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la requête de signature en ligne du contrat');
      } finally {
        this.$q.loading.hide();
      }
    },
    hasToBeSignedOnline (contract) {
      return !!(contract.signature && contract.signature.eversignId);
    },
    shouldSignDocument (contractStatus, contractSignature) {
      if (!contractSignature.signedBy) return true;

      switch (this.personKey) {
        case COACH:
          return contractStatus === COMPANY_CONTRACT && !contractSignature.signedBy.other;
        case AUXILIARY:
          return !contractSignature.signedBy.auxiliary;
        case CUSTOMER:
          return contractStatus === CUSTOMER_CONTRACT && !contractSignature.signedBy.other;
      }
    },
    getContractLink (contract) {
      if (this.personKey === CUSTOMER) {
        return contract.customerDoc ? contract.customerDoc.link : false;
      }
      return contract.auxiliaryDoc ? contract.auxiliaryDoc.link : false;
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .contract-card
    background: white
    width: 100%
    margin-bottom: 20px

  .card-title
    font-size: 18px
    padding: 16px 10px

  .card-subtitle
    margin:  0 10px 10px
    font-size: 14px

  .toolbar-padding
    padding: 20px 58px

  /deep/ .q-layout-header
    box-shadow: none

  .iframe-normal
    position: absolute
    width: 100%
    height:100%

  .contract-actions
    justify-content: normal !important

</style>
