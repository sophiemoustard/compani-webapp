<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration RH</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Heures internes</p>
        <q-card>
          <ni-responsive-table :data="internalHours" :columns="internalHoursColumns" :pagination.sync="pagination">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'default'">
                    <q-checkbox :disable="col.value" :value="col.value"
                      @input="updateDefaultInternalHour(props.row._id)" />
                  </template>
                  <template v-else-if="col.name === 'actions'">
                    <q-btn :disable="props.row.default" flat round small color="grey" icon="delete"
                      @click="validateInternalHourDeletion(col.value, props.row)" />
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une heure interne"
              @click="newInternalHourModal = true" :disable="internalHours.length >= MAX_INTERNAL_HOURS_NUMBER" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats prestataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut"
            :error="$v.company.rhConfig.contractWithCompany.grossHourlyRate.$error"
            :error-label="nbrError('contractWithCompany.grossHourlyRate')" type="number"
            v-model="company.rhConfig.contractWithCompany.grossHourlyRate"
            @focus="saveTmp('rhConfig.contractWithCompany.grossHourlyRate')" suffix="€"
            @blur="updateCompany('rhConfig.contractWithCompany.grossHourlyRate')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Contrats mandataires</p>
        <div class="row gutter-profile">
          <ni-input caption="Taux horaire brut par défaut"
            :error="$v.company.rhConfig.contractWithCustomer.grossHourlyRate.$error"
            :error-label="nbrError('contractWithCustomer.grossHourlyRate')" type="number"
            v-model="company.rhConfig.contractWithCustomer.grossHourlyRate"
            @focus="saveTmp('rhConfig.contractWithCustomer.grossHourlyRate')" suffix="€"
            @blur="updateCompany('rhConfig.contractWithCustomer.grossHourlyRate')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Remboursement frais</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant des frais" :error="$v.company.rhConfig.feeAmount.$error"
            :error-label="nbrError('feeAmount')" type="number" v-model="company.rhConfig.feeAmount"
            @focus="saveTmp('rhConfig.feeAmount')" suffix="€" @blur="updateCompany('rhConfig.feeAmount')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Taux kilométrique</p>
        <div class="row gutter-profile">
          <ni-input caption="Montant par kilomètre" :error="$v.company.rhConfig.amountPerKm.$error"
            :error-label="nbrError('amountPerKm')" type="number" v-model="company.rhConfig.amountPerKm"
            @focus="saveTmp('rhConfig.amountPerKm')" suffix="€" @blur="updateCompany('rhConfig.amountPerKm')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Abonnements transports en commun</p>
        <div class="row gutter-profile">
          <template v-for="(transportSub, index) in company.rhConfig.transportSubs">
            <ni-input :caption="transportSub.department" :error="$v.company.rhConfig.transportSubs.$each[index].$error"
              type="number" v-model="company.rhConfig.transportSubs[index].price" :key="index"
              @focus="saveTmp(`rhConfig.transportSubs[${index}].price`)" suffix="€"
              @blur="updateCompanyTransportSubs({ vuelidatePath: `rhConfig.transportSubs.$each[${index}]`, index })" />
          </template>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat prestataire" path="rhConfig.templates.contractWithCompany"
              :entity="company" alt="template contrat prestataire" name="contractWithCompany" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(company.rhConfig.templates.contractWithCompany.driveId, 'contractWithCompany', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_contrat_prestataire_${company.name}`" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat prestataire"
              path="rhConfig.templates.contractWithCompanyVersion" :entity="company" alt="template avenant prestataire"
              name="contractWithCompanyVersion" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(company.rhConfig.templates.contractWithCompanyVersion.driveId, 'contractWithCompanyVersion', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_avenant_prestataire_${company.name}`" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle de contrat mandataire" path="rhConfig.templates.contractWithCustomer"
              :entity="company" alt="template contrat mandataire" name="contractWithCustomer" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(company.rhConfig.templates.contractWithCustomer.driveId, 'contractWithCustomer', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_contrat_mandataire_${company.name}`" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Modèle d'avenant au contrat mandataire"
              path="rhConfig.templates.contractWithCustomerVersion" :entity="company" alt="template avenant mandataire"
              name="contractWithCustomerVersion" :url="docsUploadUrl"
              @delete="validateDocumentDeletion(company.rhConfig.templates.contractWithCustomerVersion.driveId, 'contractWithCustomerVersion', 'rhConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_avenant_mandataire_${company.name}`" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Équipes</p>
        <q-card>
          <ni-responsive-table :data="sectors" :columns="sectorsColumns" :pagination.sync="sectorPagination">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <q-btn flat round small color="grey" icon="edit"
                        @click.native="openEditionModal(col.value._id)" />
                      <q-btn flat round small color="grey" icon="delete" :disable="col.value.auxiliaryCount > 0"
                        @click="validateSectorDeletion(col.value._id, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter une équipe"
              @click="sectorCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Internal hour creation modal -->
    <ni-modal v-model="newInternalHourModal" @hide="resetInternalHourCreationModal">
      <template slot="title">
        Créer une <span class="text-weight-bold">heure interne</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newInternalHour.name" :error="$v.newInternalHour.name.$error"
        @blur="$v.newInternalHour.name.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'heure interne" icon-right="add" color="primary"
          :loading="loading" @click="createInternalHour" />
      </template>
    </ni-modal>

    <!-- Sector creation modal -->
    <ni-modal v-model="sectorCreationModal" @hide="resetCreationSectorData">
      <template slot="title">
        Ajouter une <span class="text-weight-bold">équipe</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSector.name" :error="$v.newSector.name.$error"
        :error-label="sectorNameError($v.newSector)" @blur="$v.newSector.name.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter une équipe" icon-right="add" color="primary"
          :disable="newSector.name === ''" :loading="loading" @click="createNewSector" />
      </template>
    </ni-modal>

    <!-- Sector edition modal -->
    <ni-modal v-model="sectorEditionModal" @hide="resetEditionSectorData">
      <template slot="title">
        Editer l'<span class="text-weight-bold">équipe</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedSector.name" :error="$v.editedSector.name.$error"
        :error-label="sectorNameError($v.editedSector)" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer l'équipe" icon-right="add" color="primary"
          :disable="isSameThanEditedSector" :loading="loading" @click="updateSector" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, maxValue } from 'vuelidate/lib/validators';
import { posDecimals, sector } from '../../../helpers/vuelidateCustomVal';
import { NotifyWarning, NotifyPositive, NotifyNegative } from '../../../components/popup/notify';
import Input from '../../../components/form/Input';
import FileUploader from '../../../components/form/FileUploader.vue';
import Modal from '../../../components/Modal';
import ResponsiveTable from '../../../components/table/ResponsiveTable';
import { configMixin } from '../../../mixins/configMixin';
import { REQUIRED_LABEL } from '../../../data/constants';
import { validationMixin } from '../../../mixins/validationMixin';
import { tableMixin } from '../../../mixins/tableMixin';

export default {
  name: 'RhConfig',
  metaInfo: { title: 'Configuration rh' },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-modal': Modal,
    'ni-responsive-table': ResponsiveTable,
  },
  mixins: [configMixin, validationMixin, tableMixin],
  data () {
    return {
      MAX_INTERNAL_HOURS_NUMBER: 9,
      company: null,
      internalHours: [],
      internalHoursColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'default',
          label: 'Type par défaut',
          align: 'left',
          field: 'default',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
          sortable: true,
        },
      ],
      newInternalHourModal: false,
      newInternalHour: { name: '' },
      loading: false,
      pagination: { rowsPerPage: 0 },
      sectors: [],
      sectorsColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: row => ({ _id: row._id, auxiliaryCount: row.auxiliaryCount }),
        },
      ],
      sectorPagination: {
        rowsPerPage: 0,
        sortBy: 'name',
      },
      sectorCreationModal: false,
      newSector: { name: '' },
      sectorEditionModal: false,
      editedSector: { name: '' },
    }
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    isSameThanEditedSector () {
      return this.tmpInput === this.editedSector.name;
    },
  },
  validations () {
    return {
      company: {
        rhConfig: {
          contractWithCompany: {
            grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) },
          },
          contractWithCustomer: {
            grossHourlyRate: { required, posDecimals, maxValue: maxValue(999) },
          },
          feeAmount: { required, posDecimals, maxValue: maxValue(999) },
          amountPerKm: { required, posDecimals, maxValue: maxValue(999) },
          transportSubs: {
            $each: {
              price: { required, posDecimals, maxValue: maxValue(999) },
            },
          },
        },
      },
      newInternalHour: {
        name: { required },
      },
      newSector: {
        name: { required, sector },
      },
      editedSector: {
        name: { required, sector },
      },
    }
  },
  async mounted () {
    this.company = this.$_.cloneDeep(this.user.company);
    if (!this.company.rhConfig.templates) this.company.rhConfig.templates = {};

    await this.refreshInternalHours();
    await this.getSectors();
  },
  methods: {
    async updateCompanyTransportSubs (params) {
      try {
        this.$_.get(this.$v.company, params.vuelidatePath).$touch();
        if (this.$_.get(this.$v.company, params.vuelidatePath).$error) return NotifyWarning('Champ(s) invalide(s)');

        const price = this.company.rhConfig.transportSubs[params.index].price
        if (this.tmpInput === price) return;
        const payload = {
          rhConfig: {
            transportSubs: {
              subId: this.company.rhConfig.transportSubs[params.index]._id,
              price: this.company.rhConfig.transportSubs[params.index].price,
            },
          },
        };
        await this.$companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée');
        this.tmpInput = '';
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
        this.tmpInput = '';
      }
    },
    nbrError (path) {
      if (!this.$_.get(this.$v.company.rhConfig, path).required) return REQUIRED_LABEL;
      else if (!this.$_.get(this.$v.company.rhConfig, path).numeric) return 'Nombre non valide';
    },
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
    },
    // Internal hours
    resetInternalHourCreationModal () {
      this.newInternalHour = { name: '' };
      this.$v.newInternalHour.$reset();
    },
    async refreshInternalHours () {
      try {
        this.internalHours = await this.$internalHours.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des heures internes');
        this.internalHours = [];
      }
    },
    async createInternalHour () {
      try {
        this.$v.newInternalHour.$touch();
        if (this.$v.newInternalHour.$error) return;

        this.loading = true;
        if (!this.internalHours || this.internalHours.length === 0) this.newInternalHour.default = true;
        const payload = this.$_.pickBy(this.newInternalHour);
        await this.$internalHours.create(payload);
        await this.$store.dispatch('main/getUser', this.user._id);

        NotifyPositive('Heure interne créée');
        this.newInternalHourModal = false;
        await this.refreshInternalHours();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'heure interne');
      } finally {
        this.loading = false;
      }
    },
    async deleteInternalHour (internalHourId, row) {
      try {
        const index = this.getRowIndex(this.internalHours, row);
        await this.$internalHours.remove(internalHourId);
        await this.$store.dispatch('main/getUser', this.user._id);
        this.internalHours.splice(index, 1);
        NotifyPositive('Heure interne supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression d\'une heure interne.');
      }
    },
    validateInternalHourDeletion (internalHourId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer cette heure interne ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteInternalHour(internalHourId, row))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    async updateDefaultInternalHour (internalHourId) {
      try {
        const defaultInternalHour = this.internalHours.find(internalHour => internalHour.default);
        if (defaultInternalHour) {
          await this.$internalHours.update(defaultInternalHour._id, { default: false });
        }

        await this.$internalHours.update(internalHourId, { default: true });
        await this.refreshInternalHours();
        await this.$store.dispatch('main/getUser', this.user._id);
        NotifyPositive('Heures internes mises à jour')
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour des heures internes.')
      }
    },
    // Sectors
    async getSectors () {
      try {
        this.sectors = await this.$sectors.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des équipes.')
      }
    },
    async createNewSector () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.newSector.name);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await this.$sectors.create(this.newSector);
        NotifyPositive('Équipe créée.');
        this.resetCreationSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la création de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetCreationSectorData () {
      this.sectorCreationModal = false
      this.newSector = { name: '' };
      this.$v.newSector.$reset();
    },
    openEditionModal (id) {
      const selectedSector = this.sectors.find(sector => sector._id === id);
      this.editedSector = { _id: selectedSector._id, name: selectedSector.name };
      this.tmpInput = this.editedSector.name;
      this.sectorEditionModal = true;
    },
    async updateSector () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.editedSector.name);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await this.$sectors.updateById(this.editedSector._id, { name: this.editedSector.name });
        NotifyPositive('Équipe modifiée.');
        this.resetEditionSectorData();
        await this.getSectors();
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification de l'équipe");
      } finally {
        this.loading = false;
      }
    },
    resetEditionSectorData () {
      this.sectorEditionModal = false;
      this.editedSector = { name: '' };
      this.$v.editedSector.$reset();
    },
    async deleteSector (sectorId, row) {
      try {
        const index = this.getRowIndex(this.sectors, row);
        await this.$sectors.deleteById(sectorId);
        this.sectors.splice(index, 1);
        NotifyPositive('Équipe supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la suppression de l'équipe.");
      }
    },
    validateSectorDeletion (sectorId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer cette équipe ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteSector(sectorId, row))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    sectorNameError (obj) {
      if (!obj.name.required) return REQUIRED_LABEL;
      else if (!obj.name.sector) return 'Nom déjà existant';
    },
  },
}
</script>

<style lang="stylus" scoped>
  .doc-thumbnail
    padding: 13px 0px 40px 12px

  .doc-delete
    padding: 0px 14px 17px 0px
</style>
