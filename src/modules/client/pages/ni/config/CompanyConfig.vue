<template>
  <q-page class="client-background" padding>
    <div v-if="company">
      <h4>Configuration générale</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Raison sociale" v-model="company.name" @focus="saveTmp('name')"
            @blur="updateCompany('name')"  :error="$v.company.name.$error" />
          <ni-input caption="Nom commercial" v-model="company.tradeName" @focus="saveTmp('tradeName')"
            @blur="updateCompany('tradeName')" :error="$v.company.tradeName.$error"
            :error-label="tradeNameError($v.company)" />
          <ni-search-address v-model="company.address" color="white" inverted-light :error-label="addressError"
            @focus="saveTmp('address.fullAddress')" @blur="updateCompany('address')"
            :error="$v.company.address.$error" />
          <ni-input v-if="company.type === COMPANY" caption="Numéro RCS" v-model="company.rcs" @focus="saveTmp('rcs')"
            @blur="updateCompany('rcs')" :error="$v.company.rcs.$error" :error-label="rcsError" />
          <ni-input v-else caption="Numéro RNA" v-model="company.rna" @focus="saveTmp('rna')"
            @blur="updateCompany('rna')" :error="$v.company.rna.$error" :error-label="rcsError" />
        </div>
      </div>
      <div class="q-mb-xl" v-if="canUpdateErpConfig">
        <p class="text-weight-bold">Représentant légal</p>
        <div class="row gutter-profile">
          <ni-input caption="Prénom" :error="$v.company.legalRepresentative.firstname.$error"
            v-model="company.legalRepresentative.firstname" @focus="saveTmp('legalRepresentative.firstname')"
            error-label="Prénom invalide" @blur="updateCompany('legalRepresentative.firstname')" />
          <ni-input caption="Nom" :error="$v.company.legalRepresentative.lastname.$error" error-label="Nom invalide"
            v-model="company.legalRepresentative.lastname" @focus="saveTmp('legalRepresentative.lastname')"
            @blur="updateCompany('legalRepresentative.lastname')" />
          <ni-input caption="Fonction" :error="$v.company.legalRepresentative.position.$error"
            v-model="company.legalRepresentative.position" @focus="saveTmp('legalRepresentative.position')"
            error-label="Fonction invalide" @blur="updateCompany('legalRepresentative.position')" />
        </div>
      </div>
      <div class="q-mb-xl" v-if="canUpdateErpConfig">
        <p class="text-weight-bold">Facturation</p>
        <div class="row gutter-profile">
          <ni-input caption="IBAN" :error="$v.company.iban.$error" :error-label="ibanError" v-model.trim="company.iban"
            @focus="saveTmp('iban')" upper-case @blur="updateCompany('iban')" />
          <ni-input caption="BIC" :error="$v.company.bic.$error" :error-label="bicError" upper-case
            v-model.trim="company.bic" @focus="saveTmp('bic')" @blur="updateCompany('bic')" />
          <ni-input caption="Numéro ICS" v-model="company.ics" @focus="saveTmp('ics')" @blur="updateCompany('ics')"
            :error="$v.company.ics.$error" />
          <ni-input caption="Support facturation" :error="$v.company.billingAssistance.$error"
            :error-label="billingAssistanceError" v-model.trim="company.billingAssistance"
            @focus="saveTmp('billingAssistance')" @blur="updateCompany('billingAssistance')" />
        </div>
      </div>
      <div class="q-mb-xl" v-if="canUpdateErpConfig">
        <p class="text-weight-bold">Paie</p>
        <div class="row gutter-profile">
          <ni-input caption="Code APE/NAF" :error="$v.company.apeCode.$error" error-label="Code APE/NAF invalide"
            v-model="company.apeCode" mask="XXXXX" @focus="saveTmp('apeCode')" @blur="updateCompany('apeCode')" />
        </div>
      </div>
      <div class="q-mb-xl" v-if="canUpdateErpConfig">
        <p class="text-weight-bold">Établissements</p>
        <q-card>
          <ni-responsive-table :data="establishments" :columns="establishmentsColumns" :loading="establishmentsLoading"
            :pagination.sync="establishmentsPagination">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <q-btn flat round small color="grey" icon="edit"
                        @click="openEstablishmentEditionModal(col.value)" />
                      <q-btn flat round small color="grey" icon="delete" :disable="props.row.usersCount > 0"
                        @click="validateEstablishmentDeletion(col.value)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un établissement"
              @click="establishmentCreationModal = true" :disable="establishmentsLoading" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Establishment creation modal -->
    <ni-modal v-model="establishmentCreationModal" @hide="resetEstablishmentCreationModal">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">établissement</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newEstablishment.name" :error="$v.newEstablishment.name.$error"
        :error-label="establishmentNameError($v.newEstablishment)" @blur="$v.newEstablishment.name.$touch"
        required-field />
      <ni-input in-modal caption="SIRET" v-model="newEstablishment.siret" :error="$v.newEstablishment.siret.$error"
        :error-label="establishmentSiretError($v.newEstablishment)" @blur="$v.newEstablishment.siret.$touch"
        required-field />
      <ni-search-address in-modal v-model="newEstablishment.address" color="white"
        @blur="$v.newEstablishment.address.$touch" :error-label="establishmentAddressError($v.newEstablishment)"
        :error="$v.newEstablishment.address.$error" required-field />
      <ni-input in-modal caption="Téléphone" v-model="newEstablishment.phone" :error="$v.newEstablishment.phone.$error"
        :error-label="establishmentPhoneError($v.newEstablishment)" @blur="$v.newEstablishment.phone.$touch"
        required-field />
      <ni-select in-modal caption="Service de santé du travail" v-model="newEstablishment.workHealthService"
        :options="workHealthServices" :error="$v.newEstablishment.workHealthService.$error"
        :error-label="establishmentWhsError($v.newEstablishment)" @blur="$v.newEstablishment.workHealthService.$touch"
        required-field />
      <ni-select in-modal caption="Code URSSAF" v-model="newEstablishment.urssafCode" :options="urssafCodes"
        :error="$v.newEstablishment.urssafCode.$error" :error-label="establishmentUrssafCodeError($v.newEstablishment)"
        @blur="$v.newEstablishment.urssafCode.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un établissement" icon-right="add" color="primary"
          :disable="!$v.newEstablishment.$anyDirty || $v.newEstablishment.$invalid" :loading="loading"
          @click="createNewEstablishment" />
      </template>
    </ni-modal>

    <!-- Establishment edition modal -->
    <ni-modal v-model="establishmentEditionModal" @hide="resetEstablishmentEditionModal">
      <template slot="title">
        Éditer l'<span class="text-weight-bold">établissement</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedEstablishment.name" :error="$v.editedEstablishment.name.$error"
        :error-label="establishmentNameError($v.editedEstablishment)" @blur="$v.editedEstablishment.name.$touch"
        required-field />
      <ni-input in-modal caption="SIRET" v-model="editedEstablishment.siret"
        :error="$v.editedEstablishment.siret.$error" :error-label="establishmentSiretError($v.editedEstablishment)"
        @blur="$v.editedEstablishment.siret.$touch" required-field />
      <ni-search-address in-modal v-model="editedEstablishment.address" color="white"
        @blur="$v.editedEstablishment.address.$touch" :error-label="establishmentAddressError($v.editedEstablishment)"
        :error="$v.editedEstablishment.address.$error" required-field />
      <ni-input in-modal caption="Téléphone" v-model="editedEstablishment.phone"
        :error="$v.editedEstablishment.phone.$error" :error-label="establishmentPhoneError($v.editedEstablishment)"
        @blur="$v.editedEstablishment.phone.$touch" required-field />
      <ni-select in-modal caption="Service de santé du travail" v-model="editedEstablishment.workHealthService"
        :options="workHealthServices" :error="$v.editedEstablishment.workHealthService.$error"
        :error-label="establishmentWhsError($v.editedEstablishment)"
        @blur="$v.editedEstablishment.workHealthService.$touch" required-field />
      <ni-select in-modal caption="Code URSSAF" v-model="editedEstablishment.urssafCode" :options="urssafCodes"
        :error="$v.editedEstablishment.urssafCode.$error"
        :error-label="establishmentUrssafCodeError($v.editedEstablishment)"
        @blur="$v.editedEstablishment.urssafCode.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer l'établissement" icon-right="add" color="primary"
          :disable="$v.editedEstablishment.$invalid" :loading="loading" @click="updateEstablishment" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import pick from 'lodash/pick';
import { required, maxLength } from 'vuelidate/lib/validators';
import Establishments from '@api/Establishments';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import SearchAddress from '@components/form/SearchAddress.vue';
import {
  frAddress,
  validWorkHealthService,
  validUrssafCode,
  validSiret,
  frPhoneNumber,
} from '@helpers/vuelidateCustomVal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL, COMPANY } from '@data/constants';
import { urssafCodes } from '@data/urssafCodes';
import { workHealthServices } from '@data/workHealthServices';
import { companyMixin } from '@mixins/companyMixin';
import { defineAbilitiesFor } from '@helpers/ability';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'CompanyConfig',
  metaInfo: { title: 'Configuration générale' },
  components: {
    'ni-input': Input,
    'ni-search-address': SearchAddress,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-responsive-table': ResponsiveTable,
  },
  mixins: [configMixin, validationMixin, tableMixin, companyMixin],
  data () {
    return {
      company: null,
      documents: null,
      COMPANY,
      loading: false,
      establishmentsLoading: false,
      // Establishment
      establishments: [],
      establishmentsColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'siret',
          label: 'SIRET',
          align: 'left',
          field: 'siret',
        },
        {
          name: 'address',
          label: 'Adresse',
          align: 'left',
          field: row => get(row, 'address.fullAddress') || '',
        },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: 'phone',
        },
        {
          name: 'workHealthService',
          label: 'Service de santé du travail',
          align: 'left',
          field: 'workHealthService',
          format: value => value ? get(workHealthServices.find(whs => whs.value === value), 'label', '') : '',
        },
        {
          name: 'urssafCode',
          label: 'Code URSSAF',
          align: 'left',
          field: 'urssafCode',
          format: value => value ? get(urssafCodes.find(code => code.value === value), 'label', '') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      establishmentsPagination: { rowsPerPage: 0, sortBy: 'name' },
      establishmentCreationModal: false,
      newEstablishment: {
        name: '',
        siret: '',
        address: { fullAddress: '' },
        phone: '',
        workHealthService: '',
        urssafCode: '',
      },
      editedEstablishment: {
        name: '',
        siret: '',
        address: { fullAddress: '' },
        phone: '',
        workHealthService: '',
        urssafCode: '',
      },
      establishmentEditionModal: false,
      workHealthServices,
      urssafCodes,
      establishmentValidation: {
        name: { required, maxLength: maxLength(32) },
        siret: { required, validSiret },
        address: { fullAddress: { required, frAddress } },
        phone: { required, frPhoneNumber },
        workHealthService: { required, validWorkHealthService },
        urssafCode: { required, validUrssafCode },
      },
    };
  },
  validations () {
    return {
      company: this.companyValidation,
      newEstablishment: this.establishmentValidation,
      editedEstablishment: this.establishmentValidation,
    };
  },
  computed: {
    ...mapGetters({ clientRole: 'main/clientRole' }),
    canUpdateErpConfig () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company']));

      return ability.can('update', 'erp_config');
    },
  },
  async mounted () {
    if (this.canUpdateErpConfig) await Promise.all([this.refreshCompany(), this.getEstablishments()]);
    else await this.refreshCompany();
  },
  methods: {
    async refreshCompany () {
      await this.$store.dispatch('main/fetchLoggedUser', this.loggedUser._id);
      this.company = this.loggedCompany;
      this.company.address = this.company.address || { fullAddress: '' };
      this.company.legalRepresentative =
        this.company.legalRepresentative || { lastname: '', firstname: '', position: '' };
    },
    // Establishment
    async getEstablishments () {
      try {
        this.establishmentsLoading = true;
        this.establishments = await Establishments.list();
      } catch (e) {
        console.error(e);
        this.establishments = [];
        NotifyNegative('Erreur lors de la récupération des établissements.')
      } finally {
        this.establishmentsLoading = false;
      }
    },
    resetEstablishmentCreationModal () {
      this.newEstablishment = {
        name: '',
        siret: '',
        address: {},
        phone: '',
        workHealthService: '',
        urssafCode: '',
      };
      this.$v.newEstablishment.$reset();
    },
    async createNewEstablishment () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.newEstablishment);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await Establishments.create(this.newEstablishment);
        NotifyPositive('Établissement créé.');
        this.establishmentCreationModal = false;
        await this.getEstablishments();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        return NotifyNegative("Erreur lors de la création de l'établissement.");
      } finally {
        this.loading = false;
      }
    },
    openEstablishmentEditionModal (establishmentId) {
      this.editedEstablishment = cloneDeep(this.establishments.find(est => est._id === establishmentId)) ||
        this.editedEstablishment;
      this.establishmentEditionModal = true;
    },
    resetEstablishmentEditionModal () {
      this.editedEstablishment = {
        name: '',
        siret: '',
        address: {},
        phone: '',
        workHealthService: '',
        urssafCode: '',
      };
      this.$v.editedEstablishment.$reset();
    },
    async updateEstablishment () {
      try {
        const isValid = await this.waitForFormValidation(this.$v.editedEstablishment);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const fileds = ['name', 'siret', 'address', 'phone', 'workHealthServices', 'urssafCodes'];
        await Establishments.update(this.editedEstablishment._id, pick(this.editedEstablishment, fileds));

        NotifyPositive('Établissement modifié.');
        this.establishmentEditionModal = false;
        await this.getEstablishments();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        return NotifyNegative("Erreur lors de la modification de l'établissement");
      } finally {
        this.loading = false;
      }
    },
    async deleteEstablishment (establishmentId) {
      try {
        await Establishments.remove(establishmentId);
        await this.getEstablishments();
        NotifyPositive('Établissement supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la suppression de l'établissement.");
      }
    },
    validateEstablishmentDeletion (sectorId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer cet établissement ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteEstablishment(sectorId))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    establishmentNameError (validationObj) {
      if (!validationObj.name.required) return REQUIRED_LABEL;
      else if (!validationObj.name.maxLength) return '32 caractères maximimum';
      return '';
    },
    establishmentSiretError (validationObj) {
      if (!validationObj.siret.required) return REQUIRED_LABEL;
      else if (!validationObj.siret.validSiret) return 'Siret non valide';
      return '';
    },
    establishmentAddressError (validationObj) {
      if (!validationObj.address.required) return REQUIRED_LABEL;
      else if (!validationObj.address.frAddress) return 'Adresse invalide';
      return '';
    },
    establishmentPhoneError (validationObj) {
      if (!validationObj.phone.required) return REQUIRED_LABEL;
      else if (!validationObj.phone.frPhoneNumber) return 'Numéro de téléphone invalide';
      return '';
    },
    establishmentWhsError (validationObj) {
      if (!validationObj.workHealthService.required) return REQUIRED_LABEL;
      else if (!validationObj.workHealthService.validWorkHealthService) return 'Service de santé du travail invalide';
      return '';
    },
    establishmentUrssafCodeError (validationObj) {
      if (!validationObj.urssafCode.required) return REQUIRED_LABEL;
      else if (!validationObj.urssafCode.validUrssafCode) return 'Code URSSAF invalide';
      return '';
    },
  },
}
</script>
