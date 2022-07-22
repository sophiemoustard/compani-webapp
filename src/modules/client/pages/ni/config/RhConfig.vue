<template>
  <q-page class="client-background" padding>
    <div v-if="company">
      <ni-title-header title="Configuration RH" class="q-mb-xl" />
      <div class="q-mb-xl">
        <p class="text-weight-bold">Heures internes</p>
        <q-card>
          <ni-responsive-table :data="internalHours" :columns="internalHoursColumns" v-model:pagination="pagination"
            :loading="internalHoursLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <ni-button icon="delete" @click="validateInternalHourDeletion(props.row)" />
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter une heure interne" @click="internalHourCreationModal = true"
              :disable="internalHours.length >= MAX_INTERNAL_HOURS_NUMBER || internalHoursLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut" :error="v$.company.rhConfig.grossHourlyRate.$error"
            :error-message="nbrError('company.rhConfig.grossHourlyRate')" type="number"
            v-model="company.rhConfig.grossHourlyRate" @focus="saveTmp('rhConfig.grossHourlyRate')" suffix="€"
            @blur="updateCompany('rhConfig.grossHourlyRate')" />
          <div class="col-xs-12 col-md-6">
              <q-checkbox v-model="company.rhConfig.shouldPayHolidays" dense class="q-mr-sm"
                @update:model-value="updateCompany('rhConfig.shouldPayHolidays')" />
              <span>Les jours fériés ne sont pas travaillés</span>
              <div class="text">
                Si vous cochez cette option, les jours fériés ne seront pas considérés comme des jours à travailler,
                cela impactera les compteurs d'heures et la paie
              </div>
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement frais</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant des frais" :error="v$.company.rhConfig.phoneFeeAmount.$error" type="number"
            :error-message="nbrError('company.rhConfig.phoneFeeAmount')" v-model="company.rhConfig.phoneFeeAmount"
            @focus="saveTmp('rhConfig.phoneFeeAmount')" suffix="€" @blur="updateCompany('rhConfig.phoneFeeAmount')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Taux kilométrique</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant par kilomètre" :error="v$.company.rhConfig.amountPerKm.$error" type="number"
            :error-message="nbrError('company.rhConfig.amountPerKm')" v-model="company.rhConfig.amountPerKm"
            @focus="saveTmp('rhConfig.amountPerKm')" suffix="€" @blur="updateCompany('rhConfig.amountPerKm')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <template v-if="company.rhConfig.transportSubs">
            <template v-for="(transportSub, index) in company.rhConfig.transportSubs" :key="index">
              <ni-input :caption="transportSub.department" v-model="company.rhConfig.transportSubs[index].price"
                @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)" suffix="€" type="number"
                :error-message="getTransportSubErrorMessage(index)" @blur="updateCompanyTransportSubs(index)"
                :error="getTransportSubError(index)" />
            </template>
          </template>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Modèles contrat</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat prestataire" path="rhConfig.templates.contract" drive-storage
              :entity="company" name="contract" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(company.rhConfig.templates.contract.driveId, 'contract', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_contrat_prestataire_${company.name}`" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat prestataire" drive-storage
              path="rhConfig.templates.contractVersion" :entity="company"
              name="contractVersion" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(
                company.rhConfig.templates.contractVersion.driveId,
                'contractVersion',
                'rhConfig'
              )"
              @uploaded="documentUploaded" :additional-value="`modele_avenant_prestataire_${company.name}`" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents administratifs</p>
        <q-card>
          <ni-responsive-table :data="administrativeDocuments" :columns="administrativeDocumentsColumns"
            v-model:pagination="administrativeDocumentsPagination" :loading="administrativeDocumentsLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button @click="downloadDriveDoc(props.row)" icon="file_download"
                        :disable="!getDriveId(props.row) || disableAdministrativeDocument" />
                      <ni-button :disable="!getDriveId(props.row) || disableAdministrativeDocument" icon="delete"
                        @click="validateAdministrativeDocumentDeletion(props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter un document" :disable="administrativeDocumentsLoading"
              @click="administrativeDocumentCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Équipes</p>
        <q-card>
          <ni-responsive-table :data="sectors" :columns="sectorsColumns" v-model:pagination="sectorsPagination"
            :loading="sectorsLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="edit" @click="openEditionModal(props.row._id)" />
                      <ni-button icon="delete" :disable="props.row.hasAuxiliaries"
                        @click="validateSectorDeletion(props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter une équipe" @click="sectorCreationModal = true"
              :disable="sectorsLoading" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <internal-hour-creation-modal v-model="internalHourCreationModal" :validations="v$.newInternalHour"
      v-model:new-internal-hour="newInternalHour" @hide="resetInternalHourCreationModal" @submit="createInternalHour"
      :loading="loading" />

    <administrative-document-creation-modal v-model="administrativeDocumentCreationModal" :loading="loading"
      v-model:new-administrative-document="newAdministrativeDocument" @submit="createNewAdministrativeDocument"
      :validations="v$.newAdministrativeDocument" @hide="resetAdministrativeDocumentModal" />

    <sector-creation-modal v-model="sectorCreationModal" :loading="loading" @hide="resetCreationSectorData"
      v-model:new-sector="newSector" @submit="createNewSector" :validations="v$.newSector" />

    <sector-edition-modal v-model="sectorEditionModal" :loading="loading" @hide="resetEditionSectorData"
      v-model:edited-sector="editedSector" @submit="updateSector" :validations="v$.editedSector" />
</q-page>
</template>

<script>
import { useMeta } from 'quasar';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';
import useVuelidate from '@vuelidate/core';
import { required, maxValue, helpers } from '@vuelidate/validators';
import Companies from '@api/Companies';
import Sectors from '@api/Sectors';
import AdministrativeDocument from '@api/AdministrativeDocuments';
import GoogleDrive from '@api/GoogleDrive';
import InternalHours from '@api/InternalHours';
import TitleHeader from '@components/TitleHeader';
import Button from '@components/Button';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { positiveNumber } from '@helpers/vuelidateCustomVal';
import { formatDownloadName } from '@helpers/utils';
import { REQUIRED_LABEL } from '@data/constants';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import { validationMixin } from '@mixins/validationMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';
import InternalHourCreationModal from 'src/modules/client/components/config/InternalHourCreationModal';
import AdministrativeDocCreationModal from 'src/modules/client/components/config/AdministrativeDocumentCreationModal';
import SectorCreationModal from 'src/modules/client/components/config/SectorCreationModal';
import SectorEditionModal from 'src/modules/client/components/config/SectorEditionModal';

export default {
  name: 'RhConfig',
  components: {
    'ni-title-header': TitleHeader,
    'ni-button': Button,
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-responsive-table': ResponsiveTable,
    'internal-hour-creation-modal': InternalHourCreationModal,
    'administrative-document-creation-modal': AdministrativeDocCreationModal,
    'sector-creation-modal': SectorCreationModal,
    'sector-edition-modal': SectorEditionModal,
  },
  setup () {
    const metaInfo = { title: 'Configuration rh' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  mixins: [configMixin, validationMixin, tableMixin],
  data () {
    return {
      MAX_INTERNAL_HOURS_NUMBER: 9,
      internalHours: [],
      internalHoursColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      internalHoursLoading: false,
      internalHourCreationModal: false,
      newInternalHour: { name: '' },
      loading: false,
      pagination: { rowsPerPage: 0 },
      administrativeDocuments: [],
      administrativeDocumentsColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name', sortable: true },
        { name: 'actions', label: '', align: 'center' },
      ],
      administrativeDocumentsLoading: false,
      disableAdministrativeDocument: false,
      administrativeDocumentCreationModal: false,
      administrativeDocumentsPagination: { rowsPerPage: 0 },
      newAdministrativeDocument: { name: '', file: null },
      sectors: [],
      sectorsColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        { name: 'actions', label: '', align: 'center' },
      ],
      sectorsLoading: false,
      sectorsPagination: { rowsPerPage: 0, sortBy: 'name' },
      sectorCreationModal: false,
      newSector: { name: '' },
      sectorEditionModal: false,
      editedSector: { name: '' },
    };
  },
  computed: {
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
  },
  validations () {
    return {
      company: {
        rhConfig: {
          grossHourlyRate: { required, positiveNumber, maxValue: maxValue(999) },
          phoneFeeAmount: { required, positiveNumber, maxValue: maxValue(999) },
          amountPerKm: { required, positiveNumber, maxValue: maxValue(999) },
          transportSubs: { $each: helpers.forEach({ price: { required, positiveNumber, maxValue: maxValue(999) } }) },
        },
      },
      newInternalHour: { name: { required } },
      newAdministrativeDocument: { name: { required }, file: { required } },
      newSector: { name: { required } },
      editedSector: { name: { required } },
    };
  },
  async mounted () {
    await Promise.all([
      this.refreshInternalHours(),
      this.getSectors(),
      this.getAdministrativeDocuments(),
      this.refreshCompany(),
    ]);
  },
  methods: {
    getTransportSubError (index) {
      const validation = this.v$.company.rhConfig.transportSubs.$each.$response.$errors[index];

      return get(validation, 'price.0.$response') === false;
    },
    getTransportSubErrorMessage (index) {
      const validation = this.v$.company.rhConfig.transportSubs.$each.$response.$errors[index];

      if (get(validation, 'price.0.$validator') === 'required') return REQUIRED_LABEL;
      if (get(validation, 'price.0.$validator') === 'positiveNumber' ||
        get(validation, 'price.0.$validator') === 'strictPositiveNumber') return 'Nombre non valide';

      return '';
    },
    async updateCompanyTransportSubs (index) {
      try {
        this.v$.company.rhConfig.transportSubs.$touch();
        if (this.getTransportSubError(index)) return NotifyWarning('Champ(s) invalide(s)');

        const transports = get(this.company, 'rhConfig.transportSubs');
        if (this.tmpInput === transports[index].price) return;

        const payload = {
          rhConfig: { transportSubs: { subId: transports[index]._id, price: transports[index].price } },
        };
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
    // Internal hours
    resetInternalHourCreationModal () {
      this.newInternalHour = { name: '' };
      this.v$.newInternalHour.$reset();
    },
    resetAdministrativeDocumentModal () {
      this.newAdministrativeDocument = { name: '', file: null };
      this.v$.newAdministrativeDocument.$reset();
    },
    async refreshInternalHours () {
      try {
        this.internalHoursLoading = true;
        this.internalHours = await InternalHours.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des heures internes.');
        this.internalHours = [];
      } finally {
        this.internalHoursLoading = false;
      }
    },
    async createInternalHour () {
      try {
        this.v$.newInternalHour.$touch();
        if (this.v$.newInternalHour.$error) return;

        this.loading = true;
        await InternalHours.create(pickBy(this.newInternalHour));
        await this.refreshCompany();

        NotifyPositive('Heure interne créée');
        this.internalHourCreationModal = false;
        await this.refreshInternalHours();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'heure interne.');
      } finally {
        this.loading = false;
      }
    },
    async deleteInternalHour (internalHour) {
      try {
        await InternalHours.remove(internalHour._id);
        await this.refreshCompany();

        const index = this.getRowIndex(this.internalHours, internalHour);
        this.internalHours.splice(index, 1);
        NotifyPositive('Heure interne supprimée.');
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative('Cette heure interne est rattachée à des évènements.');
        NotifyNegative('Erreur lors de la suppression d\'une heure interne.');
      }
    },
    validateInternalHourDeletion (internalHour) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette heure interne&nbsp;?',
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteInternalHour(internalHour))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    // Sectors
    async getSectors () {
      try {
        this.sectorsLoading = true;
        this.sectors = await Sectors.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des équipes.');
      } finally {
        this.sectorsLoading = false;
      }
    },
    async createNewSector () {
      try {
        this.v$.newSector.$touch();
        if (this.v$.newSector.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await Sectors.create(this.newSector);
        NotifyPositive('Équipe créée.');
        this.sectorCreationModal = false;
        await this.getSectors();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création de l\'équipe.');
      } finally {
        this.loading = false;
      }
    },
    resetCreationSectorData () {
      this.newSector = { name: '' };
      this.v$.newSector.$reset();
    },
    openEditionModal (id) {
      const selectedSector = this.sectors.find(sector => sector._id === id);
      this.editedSector = { _id: selectedSector._id, name: selectedSector.name };
      this.tmpInput = this.editedSector.name;
      this.sectorEditionModal = true;
    },
    async updateSector () {
      try {
        this.v$.editedSector.$touch();
        if (this.v$.editedSector.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await Sectors.updateById(this.editedSector._id, { name: this.editedSector.name });
        NotifyPositive('Équipe modifiée.');
        this.sectorEditionModal = false;
        await this.getSectors();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification de l\'équipe.');
      } finally {
        this.loading = false;
      }
    },
    resetEditionSectorData () {
      this.editedSector = { name: '' };
      this.v$.editedSector.$reset();
    },
    async deleteSector (sector) {
      try {
        await Sectors.deleteById(sector._id);

        const index = this.getRowIndex(this.sectors, sector);
        this.sectors.splice(index, 1);
        NotifyPositive('Équipe supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'équipe.');
      }
    },
    validateSectorDeletion (sector) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette équipe&nbsp;?',
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteSector(sector))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    // Administrative document
    getDriveId (doc) {
      return get(doc, 'driveFile.driveId') || '';
    },
    async downloadDriveDoc (doc) {
      try {
        this.disableAdministrativeDocument = true;

        const docName = formatDownloadName(doc.name);
        await GoogleDrive.downloadFileById(this.getDriveId(doc), docName);
      } catch (e) {
        console.error(e);
      } finally {
        this.disableAdministrativeDocument = false;
      }
    },
    async getAdministrativeDocuments () {
      try {
        this.administrativeDocumentsLoading = true;
        this.administrativeDocuments = await AdministrativeDocument.list();
      } catch (e) {
        console.error(e);
        this.administrativeDocuments = [];
        NotifyNegative('Erreur lors de la récupération des documents.');
      } finally {
        this.administrativeDocumentsLoading = false;
      }
    },
    formatAdministrativeDocument () {
      const { file, name } = this.newAdministrativeDocument;
      const form = new FormData();

      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('name', name);
      form.append('file', file);

      return form;
    },
    async createNewAdministrativeDocument () {
      this.v$.newAdministrativeDocument.$touch();
      if (this.v$.newAdministrativeDocument.$error) {
        return NotifyWarning('Champ(s) invalide(s)');
      }
      this.loading = true;

      try {
        await AdministrativeDocument.create(this.formatAdministrativeDocument());
        this.administrativeDocumentCreationModal = false;
        NotifyPositive('Document sauvegardé');
        await this.getAdministrativeDocuments();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi du document.');
      } finally {
        this.loading = false;
      }
    },
    async deleteAdministrativeDocument (doc) {
      try {
        await AdministrativeDocument.remove(doc._id);

        const index = this.getRowIndex(this.administrativeDocuments, doc);
        this.administrativeDocuments.splice(index, 1);
        NotifyPositive('Document supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateAdministrativeDocumentDeletion (doc) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document&nbsp;?',
        html: true,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteAdministrativeDocument(doc))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>

<style lang="sass" scoped>
.text
  font-size: 12px
  padding-left: 32px
  color: $copper-grey-600
</style>
