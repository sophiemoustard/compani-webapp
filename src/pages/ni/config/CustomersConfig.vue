<template>
  <q-page class="neutral-background" padding>
    <div v-if="company">
      <h4>Configuration Bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Plans de majoration</p>
        <q-card>
          <q-table :data="surcharges" :columns="surchargeColumns" hide-bottom binary-state-sort
            :pagination.sync="pagination" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat round small dense color="grey" icon="edit"
                      @click.native="openSurchargeEditionModal(col.value)" />
                    <q-btn flat round small dense color="grey" icon="delete"
                      @click="deleteSurcharge(col.value, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un plan de majoration"
              @click="surchargeCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card>
          <q-table :data="services" :columns="serviceColumns" hide-bottom binary-state-sort
            :pagination.sync="pagination" :visible-columns="visibleColumnsServices" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat round small dense color="grey" icon="history" @click="showHistory(col.value)" />
                    <q-btn flat round small dense color="grey" icon="edit"
                      @click="openServiceEditionModal(col.value)" />
                    <q-btn flat round small dense color="grey" icon="delete" :disable="props.row.subscriptionCount > 0"
                      @click="deleteService(col.value, props.row.__index)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service"
              @click="serviceCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Informations de l'organisation</p>
        <div class="row gutter-profile">
          <ni-input caption="Raison sociale" v-model="company.name" @focus="saveTmp('name')" @blur="updateCompany('name')" />
          <ni-input caption="Nom commercial" v-model="company.tradeName" @focus="saveTmp('tradeName')" @blur="updateCompany('tradeName')" />
          <ni-search-address v-model="company.address" color="white" inverted-light :error-label="addressError"
            @focus="saveTmp('address.fullAddress')" @blur="updateCompany('address')"
            :error="$v.company.address.$error" />
          <ni-input caption="Numéro ICS" v-model="company.ics" @focus="saveTmp('ics')" @blur="updateCompany('ics')" />
          <ni-input v-if="company.type === 'company'" caption="Numéro RCS" v-model="company.rcs" @focus="saveTmp('rcs')" @blur="updateCompany('rcs')" />
          <ni-input v-else caption="Numéro RNA" v-model="company.rna" @focus="saveTmp('rna')" @blur="updateCompany('rna')" />
          <ni-input caption="IBAN" :error="$v.company.iban.$error" :error-label="ibanError" v-model.trim="company.iban"
            @focus="saveTmp('iban')" upper-case @blur="updateCompany('iban')" />
          <ni-input caption="BIC" :error="$v.company.bic.$error" :error-label="bicError" upper-case
            v-model.trim="company.bic" @focus="saveTmp('bic')" @blur="updateCompany('bic')" />
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Mandat de prélèvement" path="customersConfig.templates.debitMandate"
              :entity="company" alt="template mandat prelevement" name="debitMandate"
              @delete="deleteDocument(documents.debitMandate.driveId, 'debitMandate', 'customersConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_mandat_prelevement_${company.name}`"
              :url="docsUploadUrl" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" :entity="company"
              alt="template devis" name="quote"
              @delete="deleteDocument(documents.quote.driveId, 'quote', 'customersConfig')" @uploaded="documentUploaded"
              :additional-value="`modele_devis_${company.name}`" :url="docsUploadUrl" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Tiers payeurs</p>
        <q-card>
          <q-table :data="thirdPartyPayers" :columns="thirdPartyPayersColumns" hide-bottom binary-state-sort
            :pagination.sync="pagination" class="table-responsive">
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
                <template v-if="col.name === 'billingMode'">
                  <div class="capitalize">{{ col.value }}</div>
                </template>
                <template v-else-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn :disable="isTppUsedInFundings(props.row.__index)" flat round small dense color="grey"
                      icon="delete" @click="deleteThirdPartyPayer(col.value, props.row.__index)" />
                    <q-btn flat round small dense color="grey" icon="edit"
                      @click="openThirdPartyPayerEditionModal(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value}}</template>
              </q-td>
            </q-tr>
          </q-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un tiers payeur"
              @click="thirdPartyPayerCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Facturation</p>
        <div class="row gutter-profile">
          <ni-select caption="Période de facturation par défaut" v-model="company.customersConfig.billingPeriod"
            @focus="saveTmp('customersConfig.billingPeriod')" @blur="updateCompany('customersConfig.billingPeriod')"
            :options="billingPeriodOptions" />
        </div>
      </div>
    </div>

    <!-- Surcharge creation modal -->
    <ni-modal v-model="surchargeCreationModal" @hide="resetCreationSurchargeData">
      <template slot="title">
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSurcharge.name" :error="$v.newSurcharge.name.$error"
        @blur="$v.newSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="newSurcharge.saturday"
        :error="$v.newSurcharge.saturday.$error" @blur="$v.newSurcharge.saturday.$touch" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="newSurcharge.sunday"
        :error="$v.newSurcharge.sunday.$error" @blur="$v.newSurcharge.sunday.$touch" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number" v-model="newSurcharge.publicHoliday"
        :error="$v.newSurcharge.publicHoliday.$error" @blur="$v.newSurcharge.publicHoliday.$touch" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="newSurcharge.twentyFifthOfDecember" :error="$v.newSurcharge.twentyFifthOfDecember.$error"
        @blur="$v.newSurcharge.twentyFifthOfDecember.$touch" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="newSurcharge.firstOfMay"
        :error="$v.newSurcharge.firstOfMay.$error" @blur="$v.newSurcharge.firstOfMay.$touch" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="newSurcharge.evening"
        :error="$v.newSurcharge.evening.$error" @blur="$v.newSurcharge.evening.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="$v.newSurcharge.eveningStartTime.$error" @blur="$v.newSurcharge.eveningStartTime.$touch"
        :disable="!newSurcharge.evening" :requiredField="!!newSurcharge.evening" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="$v.newSurcharge.eveningEndTime.$error" @blur="$v.newSurcharge.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :requiredField="!!newSurcharge.evening" error-label="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.custom"
        :error="$v.newSurcharge.custom.$error" @blur="$v.newSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="$v.newSurcharge.customStartTime.$error" @blur="$v.newSurcharge.customStartTime.$touch"
        :disable="!newSurcharge.custom" :requiredField="!!newSurcharge.custom" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="$v.newSurcharge.customEndTime.$error" @blur="$v.newSurcharge.customEndTime.$touch"
        :disable="!newSurcharge.custom" :requiredField="!!newSurcharge.custom" error-label="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le plan de majoration" icon-right="add" color="primary"
          :loading="loading" @click="createNewSurcharge" :disable="$v.newSurcharge.$error || !newSurcharge.name" />
      </template>
    </ni-modal>

    <!-- Surcharge edition modal -->
    <ni-modal v-model="surchargeEditionModal" @hide="resetEditionSurchargeData">
      <template slot="title">
        Éditer le <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedSurcharge.name" :error="$v.editedSurcharge.name.$error"
        @blur="$v.editedSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="editedSurcharge.saturday"
        :error="$v.editedSurcharge.saturday.$error" @blur="$v.editedSurcharge.saturday.$touch" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="editedSurcharge.sunday"
        :error="$v.editedSurcharge.sunday.$error" @blur="$v.editedSurcharge.sunday.$touch" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number"
        v-model="editedSurcharge.publicHoliday" :error="$v.editedSurcharge.publicHoliday.$error"
        @blur="$v.editedSurcharge.publicHoliday.$touch" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="editedSurcharge.twentyFifthOfDecember" :error="$v.editedSurcharge.twentyFifthOfDecember.$error"
        @blur="$v.editedSurcharge.twentyFifthOfDecember.$touch" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="editedSurcharge.firstOfMay"
        :error="$v.editedSurcharge.firstOfMay.$error" @blur="$v.editedSurcharge.firstOfMay.$touch" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="editedSurcharge.evening"
        :error="$v.editedSurcharge.evening.$error" @blur="$v.editedSurcharge.evening.$touch" />
      <ni-time-input in-modal v-model="editedSurcharge.eveningStartTime" caption="Début soirée"
        :error="$v.editedSurcharge.eveningStartTime.$error" @blur="$v.editedSurcharge.eveningStartTime.$touch"
        :disable="!editedSurcharge.evening" :requiredField="!!editedSurcharge.evening" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.eveningEndTime" caption="Fin soirée"
        :error="$v.editedSurcharge.eveningEndTime.$error" @blur="$v.editedSurcharge.eveningEndTime.$touch"
        :disable="!editedSurcharge.evening" :requiredField="!!editedSurcharge.evening" error-label="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="editedSurcharge.custom"
        :error="$v.editedSurcharge.custom.$error" @blur="$v.editedSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="editedSurcharge.customStartTime" caption="Début personnalisé"
        :error="$v.editedSurcharge.customStartTime.$error" @blur="$v.editedSurcharge.customStartTime.$touch"
        :disable="!editedSurcharge.custom" :requiredField="!!editedSurcharge.custom" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.customEndTime" caption="Fin personnalisée"
        :error="$v.editedSurcharge.customEndTime.$error" @blur="$v.editedSurcharge.customEndTime.$touch"
        :disable="!editedSurcharge.custom" :requiredField="!!editedSurcharge.custom" error-label="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le plan de majoration" icon-right="check"
          color="primary" :loading="loading" @click="updateSurcharge" :disable="$v.editedSurcharge.$error" />
      </template>
    </ni-modal>

    <!-- Service creation modal -->
    <ni-modal v-model="serviceCreationModal" @hide="resetCreationServiceData">
      <template slot="title">
        Créer un <span class="text-weight-bold">service</span>
      </template>
      <ni-select in-modal caption="Type" v-model="newService.type" :error="$v.newService.type.$error"
        @blur="$v.newService.type.$touch" :options="serviceTypeOptions" required-field />
      <ni-input in-modal caption="Nom" v-model="newService.name" :error="$v.newService.name.$error"
        @blur="$v.newService.name.$touch" required-field />
      <ni-select in-modal caption="Nature" v-model="newService.nature" :error="$v.newService.nature.$error"
        @blur="$v.newService.nature.$touch" :options="natureOptions" required-field />
      <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
        v-model="newService.defaultUnitAmount" :error="$v.newService.defaultUnitAmount.$error"
        @blur="$v.newService.defaultUnitAmount.$touch" required-field />
      <ni-input in-modal caption="TVA" suffix="%" v-model="newService.vat" type="number"
        :error="$v.newService.vat.$error" @blur="$v.newService.vat.$touch"
        error-label="La TVA doit être positive ou nulle" />
      <ni-select in-modal v-if="newService.nature !== FIXED" caption="Plan de majoration" v-model="newService.surcharge"
        :options="surchargesOptions" clearable />
      <div class="row q-mb-md">
        <q-checkbox label="Exonération de charges" v-model="newService.exemptFromCharges" />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary"
          :loading="loading" @click="createNewService" :disable="disableServiceCreationButton" />
      </template>
    </ni-modal>

    <!-- Service edition modal -->
    <ni-modal v-model="serviceEditionModal" @hide="resetEditionServiceData">
      <template slot="title">
        Éditer le <span class="text-weight-bold">service</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedService.name" :error="$v.editedService.name.$error"
        @blur="$v.editedService.name.$touch" required-field />
      <ni-date-input caption="Date d'effet" v-model="editedService.startDate"
        :error="$v.editedService.startDate.$error" @blur="$v.editedService.startDate.$touch" :min="minStartDate"
        in-modal required-field />
      <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
        v-model="editedService.defaultUnitAmount" :error="$v.editedService.defaultUnitAmount.$error"
        @blur="$v.editedService.defaultUnitAmount.$touch" required-field />
      <ni-input in-modal caption="TVA" suffix="%" v-model="editedService.vat" type="number"
        :error="$v.editedService.vat.$error" @blur="$v.editedService.vat.$touch"
        error-label="La TVA doit être positive ou nulle" />
      <ni-select in-modal v-if="editedService.nature !== FIXED" caption="Plan de majoration"
        v-model="editedService.surcharge" :options="surchargesOptions" clearable />
      <div class="row q-mb-md">
        <q-checkbox label="Exonération de charges" v-model="editedService.exemptFromCharges" />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary"
          :loading="loading" @click="updateService" :disable="disableServiceEditionButton" />
      </template>
    </ni-modal>

    <!-- Service history modal -->
    <ni-modal v-model="serviceHistoryModal" @hide="resetServiceHistoryData">
      <template slot="title">
        Historique du service <span class="text-weight-bold">{{ selectedService.name }}</span>
      </template>
      <q-table class="q-mb-xl table-responsive" :data="selectedService.versions" :columns="serviceColumns" hide-bottom
        binary-state-sort :pagination.sync="paginationHistory" :visible-columns="visibleHistoryColumns">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">{{ col.value }}</q-td>
        </q-tr>
      </q-table>
    </ni-modal>

    <!-- Third party payers creation modal -->
    <ni-modal v-model="thirdPartyPayerCreationModal" @hide="resetThirdPartyPayerEditionData">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newThirdPartyPayer.name" :error="$v.newThirdPartyPayer.name.$error"
        @blur="$v.newThirdPartyPayer.name.$touch" required-field />
      <ni-search-address v-model="newThirdPartyPayer.address" error-label="Adresse invalide" in-modal
        @blur="$v.newThirdPartyPayer.address.$touch" :error="$v.newThirdPartyPayer.address.$error" />
      <ni-input in-modal caption="Email" v-model.trim="newThirdPartyPayer.email" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        v-model="newThirdPartyPayer.unitTTCRate" :error="$v.newThirdPartyPayer.unitTTCRate.$error"
        error-label="Le prix unitaire doit être positif" />
      <ni-select in-modal v-model="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation"
        :filter="false" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary"
          :loading="loading" @click="createNewThirdPartyPayer" />
      </template>
    </ni-modal>

    <!-- Third party payers edition modal -->
    <ni-modal v-model="thirdPartyPayerEditionModal" @hide="resetThirdPartyPayerUpdateModalData">
      <template slot="title">
        Editer le <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedThirdPartyPayer.name"
        :error="$v.editedThirdPartyPayer.name.$error" @blur="$v.editedThirdPartyPayer.name.$touch" required-field />
      <ni-search-address v-model="editedThirdPartyPayer.address" error-label="Adresse invalide"
        @blur="$v.editedThirdPartyPayer.address.$touch" :error="$v.editedThirdPartyPayer.address.$error" in-modal />
      <ni-input in-modal caption="Email" v-model.trim="editedThirdPartyPayer.email" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        v-model="editedThirdPartyPayer.unitTTCRate" :error="$v.editedThirdPartyPayer.unitTTCRate.$error"
        error-label="Le prix unitaire doit être positif" />
      <ni-select in-modal v-model="editedThirdPartyPayer.billingMode" :options="billingModeOptions"
        caption="Facturation" :filter="false" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le tiers payeur" icon-right="check" color="primary"
          :loading="loading" @click="updateThirdPartyPayer" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, numeric, requiredIf } from 'vuelidate/lib/validators';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../../components/popup/notify';
import DateInput from '../../../components/form/DateInput.vue';
import TimeInput from '../../../components/form/TimeInput.vue';
import FileUploader from '../../../components/form/FileUploader.vue';
import { configMixin } from '../../../mixins/configMixin';
import { validationMixin } from '../../../mixins/validationMixin.js';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import SearchAddress from '../../../components/form/SearchAddress.vue';
import Modal from '../../../components/Modal';
import { frAddress, posDecimals, positiveNumber, iban, bic } from '../../../helpers/vuelidateCustomVal';
import {
  BILLING_DIRECT,
  BILLING_INDIRECT,
  REQUIRED_LABEL,
  CONTRACT_STATUS_OPTIONS,
  TWO_WEEKS,
  MONTH,
  NATURE_OPTIONS,
  FIXED,
  COMPANY,
  ASSOCIATION,
} from '../../../data/constants.js';

export default {
  name: 'CustomersConfig',
  metaInfo: { title: 'Configuration bénéficiaire' },
  components: {
    'ni-file-uploader': FileUploader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
    'ni-date-input': DateInput,
    'ni-time-input': TimeInput,
    'ni-modal': Modal,
  },
  mixins: [configMixin, validationMixin],
  watch: {
    'editedSurcharge.evening' (value) {
      if (!value) {
        this.editedSurcharge.eveningStartTime = null;
        this.editedSurcharge.eveningEndTime = null;
      }
    },
    'editedSurcharge.custom' (value) {
      if (!value) {
        this.editedSurcharge.customStartTime = null;
        this.editedSurcharge.customEndTime = null;
      }
    },
    'newSurcharge.evening' (value) {
      if (!value) {
        this.newSurcharge.eveningStartTime = null;
        this.newSurcharge.eveningEndTime = null;
      }
    },
    'newSurcharge.custom' (value) {
      if (!value) {
        this.newSurcharge.customStartTime = null;
        this.newSurcharge.customEndTime = null;
      }
    },
  },
  data () {
    return {
      selectEveningStartTime: false,
      loading: false,
      company: null,
      documents: null,
      FIXED,
      billingPeriodOptions: [
        { value: TWO_WEEKS, label: 'Quinzaine' },
        { value: MONTH, label: 'Mois' },
      ],
      // Surcharges
      surcharges: [],
      surchargeCreationModal: false,
      surchargeEditionModal: false,
      surchargesOptions: [],
      selectedSurcharge: {},
      newSurcharge: {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      },
      editedSurcharge: {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      },
      surchargeColumns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'saturday',
          label: 'Samedi',
          align: 'center',
          field: row => row.saturday && `${row.saturday}%`,
        },
        {
          name: 'sunday',
          label: 'Dimanche',
          align: 'center',
          field: row => row.sunday && `${row.sunday}%`,
        },
        {
          name: 'publicHoliday',
          label: 'Jour férié',
          align: 'center',
          field: row => row.publicHoliday && `${row.publicHoliday}%`,
        },
        {
          name: 'twentyFifthOfDecember',
          label: '25 décembre',
          align: 'center',
          field: row => row.twentyFifthOfDecember && `${row.twentyFifthOfDecember}%`,
        },
        {
          name: 'firstOfMay',
          label: '1er mai',
          align: 'center',
          field: row => row.firstOfMay && `${row.firstOfMay}%`,
        },
        {
          name: 'evening',
          label: 'Soirée',
          align: 'center',
          field: row => row.evening && `${row.evening}%`,
        },
        {
          name: 'eveningStartTime',
          label: 'Début soirée',
          align: 'left',
          field: row => row.eveningStartTime ? this.$moment(row.eveningStartTime).format('HH:mm') : '',
        },
        {
          name: 'eveningEndTime',
          label: 'Fin soirée',
          align: 'left',
          field: row => row.eveningEndTime ? this.$moment(row.eveningEndTime).format('HH:mm') : '',
        },
        {
          name: 'custom',
          label: 'Majoration personnalisée',
          align: 'center',
          field: row => row.custom && `${row.custom}%`,
        },
        {
          name: 'customStartTime',
          label: 'Début personnalisé',
          align: 'left',
          field: row => row.customStartTime ? this.$moment(row.customStartTime).format('HH:mm') : '',
        },
        {
          name: 'customEndTime',
          label: 'Fin personnalisée',
          align: 'left',
          field: row => row.customEndTime ? this.$moment(row.customEndTime).format('HH:mm') : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      // Services
      services: [],
      serviceCreationModal: false,
      serviceEditionModal: false,
      serviceHistoryModal: false,
      selectedService: {},
      newService: {
        name: '',
        type: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: null,
        exemptFromCharges: false,
      },
      editedService: {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: null,
        exemptFromCharges: false,
      },
      natureOptions: NATURE_OPTIONS,
      serviceTypeOptions: CONTRACT_STATUS_OPTIONS,
      visibleColumnsServices: ['name', 'nature', 'defaultUnitAmount', 'vat', 'surcharge', 'exemptFromCharges', 'actions'],
      visibleHistoryColumns: ['startDate', 'name', 'defaultUnitAmount', 'vat', 'surcharge', 'exemptFromCharges'],
      serviceColumns: [
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: row => row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : '',
        },
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = NATURE_OPTIONS.find(option => option.value === value);
            return nature ? this.$_.capitalize(nature.label) : '';
          },
          field: 'nature',
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire TTC par défaut',
          align: 'center',
          field: row => `${row.defaultUnitAmount}€`,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: row => row.vat && `${row.vat}%`,
        },
        {
          name: 'surcharge',
          label: 'Plan de majoration',
          align: 'left',
          field: row => row.surcharge ? row.surcharge.name : '',
        },
        {
          name: 'exemptFromCharges',
          label: 'Exonération de charges',
          align: 'center',
          field: row => row.exemptFromCharges ? 'Oui' : 'Non',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      thirdPartyPayers: [],
      thirdPartyPayersColumns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
        },
        {
          name: 'address',
          label: 'Adresse',
          align: 'left',
          field: row => row.address ? row.address.fullAddress : '',
        },
        {
          name: 'email',
          label: 'Email',
          field: 'email',
          align: 'left',
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC par défaut',
          field: 'unitTTCRate',
          format: val => val ? `${val}€` : '',
          align: 'center',
        },
        {
          name: 'billingMode',
          label: 'Facturation',
          field: 'billingMode',
          align: 'left',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
        },
      ],
      thirdPartyPayerCreationModal: false,
      newThirdPartyPayer: {
        name: '',
        email: '',
        address: { fullAddress: '' },
        unitTTCRate: '',
        billingMode: '',
      },
      billingModeOptions: [
        { label: 'Indirecte', value: BILLING_INDIRECT },
        { label: 'Directe', value: BILLING_DIRECT },
      ],
      thirdPartyPayerEditionModal: false,
      editedThirdPartyPayer: {
        address: {},
      },
      pagination: { rowsPerPage: 0 },
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
    };
  },
  validations: {
    newSurcharge: {
      name: { required },
      saturday: { numeric },
      sunday: { numeric },
      publicHoliday: { numeric },
      twentyFifthOfDecember: { numeric },
      firstOfMay: { numeric },
      evening: { numeric },
      eveningStartTime: { required: requiredIf((item) => item.evening) },
      eveningEndTime: { required: requiredIf((item) => item.evening) },
      custom: { numeric },
      customStartTime: { required: requiredIf((item) => item.custom) },
      customEndTime: { required: requiredIf((item) => item.custom) },
    },
    editedSurcharge: {
      name: { required },
      saturday: { numeric },
      sunday: { numeric },
      publicHoliday: { numeric },
      twentyFifthOfDecember: { numeric },
      firstOfMay: { numeric },
      evening: { numeric },
      eveningStartTime: { required: requiredIf((item) => item.evening) },
      eveningEndTime: { required: requiredIf((item) => item.evening) },
      custom: { numeric },
      customStartTime: { required: requiredIf((item) => item.custom) },
      customEndTime: { required: requiredIf((item) => item.custom) },
    },
    newService: {
      name: { required },
      type: { required },
      nature: { required },
      defaultUnitAmount: { required },
      vat: { positiveNumber },
    },
    editedService: {
      name: { required },
      startDate: { required },
      defaultUnitAmount: { required },
      vat: { positiveNumber },
    },
    company: {
      ics: { required },
      name: { required },
      type: { required },
      rcs: { required: requiredIf(item => item.type === COMPANY) },
      rna: { required: requiredIf(item => item.type === ASSOCIATION) },
      iban: { required, iban },
      bic: { required, bic },
      address: {
        zipCode: { required },
        street: { required },
        city: { required },
        fullAddress: { required, frAddress },
      },
      customersConfig: {
        bllingPeriod: { required },
      },
    },
    newThirdPartyPayer: {
      name: { required },
      address: {
        zipCode: { required: requiredIf(item => !!item.fullAddress) },
        street: { required: requiredIf(item => !!item.fullAddress) },
        city: { required: requiredIf(item => !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      unitTTCRate: { posDecimals },
    },
    editedThirdPartyPayer: {
      name: { required },
      address: {
        zipCode: { required: requiredIf(item => !!item.fullAddress) },
        street: { required: requiredIf(item => !!item.fullAddress) },
        city: { required: requiredIf(item => !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      unitTTCRate: { posDecimals },
    },
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    addressError () {
      return !this.$v.company.address.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    disableServiceEditionButton () {
      return !this.editedService.name || !this.editedService.startDate || !this.editedService.defaultUnitAmount ||
        !this.editedService.vat < 0;
    },
    disableServiceCreationButton () {
      return !this.newService.name || !this.newService.nature || !this.newService.defaultUnitAmount ||
        !this.newService.vat < 0;
    },
    minStartDate () {
      const selectedService = this.services.find(ser => ser._id === this.editedService._id);
      return selectedService ? this.$moment(selectedService.startDate).add(1, 'd').toISOString() : '';
    },
    ibanError () {
      if (!this.$v.company.iban.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.company.iban.iban) {
        return 'IBAN non valide';
      }
      return '';
    },
    bicError () {
      if (!this.$v.company.bic.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.company.bic.bic) {
        return 'BIC non valide';
      }
      return '';
    },
  },
  async mounted () {
    await this.refreshCompany();
    await this.refreshSurcharges();
    await this.refreshServices();
    await this.refreshThirdPartyPayers();
  },
  methods: {
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path)
    },
    // Refresh data
    async refreshSurcharges () {
      try {
        this.surchargesOptions = [];
        this.surcharges = await this.$surcharges.list();
        for (let l = this.surcharges.length, i = 0; i < l; i++) {
          if (this.surcharges[i].eveningStartTime) this.surcharges[i].eveningStartTime = this.$moment(this.surcharges[i].eveningStartTime, 'HH:mm');
          if (this.surcharges[i].eveningEndTime) this.surcharges[i].eveningEndTime = this.$moment(this.surcharges[i].eveningEndTime, 'HH:mm');
          if (this.surcharges[i].customStartTime) this.surcharges[i].customStartTime = this.$moment(this.surcharges[i].customStartTime, 'HH:mm');
          if (this.surcharges[i].customEndTime) this.surcharges[i].customEndTime = this.$moment(this.surcharges[i].customEndTime, 'HH:mm');
          this.surchargesOptions.push({
            label: this.surcharges[i].name, value: this.surcharges[i]._id,
          });
        }
      } catch (e) {
        NotifyNegative('Erreur lors du rafraîchissement des plans de majoration.');
        console.error(e);
        this.surcharges = [];
      }
    },
    async refreshServices () {
      try {
        const services = await this.$services.list();
        this.services = services.map(service => ({
          ...this.getServiceLastVersion(service),
          ...service,
        }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du rafraîchissement des services.');
        this.services = [];
      }
    },
    async refreshCompany () {
      await this.$store.dispatch('main/getUser', this.user._id);
      this.company = this.user.company;
      this.documents = this.company.customersConfig.templates || {};
      this.company.address = this.company.address || { fullAddress: '' };
    },
    async refreshThirdPartyPayers () {
      try {
        this.thirdPartyPayers = await this.$thirdPartyPayers.showAll({ company: this.company._id });
      } catch (e) {
        this.thirdPartyPayers = [];
        console.error(e);
      }
    },
    // Company
    async updateCompany (path) {
      try {
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        if (this.$_.get(this.$v.company, path)) {
          this.$_.get(this.$v.company, path).$touch();
          const isValid = await this.waitForValidation(this.$v.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = this.$_.get(this.company, path);
        const payload = this.$_.set({}, path, value);
        await this.$companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    // Surcharges
    resetCreationSurchargeData () {
      this.surchargeCreationModal = false;
      this.newSurcharge = {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      };
      this.$v.newSurcharge.$reset();
    },
    getSurchargePayload (surchargeType) {
      const payload = surchargeType;
      if (surchargeType.eveningStartTime) payload.eveningStartTime = this.$moment(surchargeType.eveningStartTime, 'HH:mm').format('HH:mm');
      if (surchargeType.eveningEndTime) payload.eveningEndTime = this.$moment(surchargeType.eveningEndTime, 'HH:mm').format('HH:mm');
      if (surchargeType.customStartTime) payload.customStartTime = this.$moment(surchargeType.customStartTime, 'HH:mm').format('HH:mm');
      if (surchargeType.customEndTime) payload.customEndTime = this.$moment(surchargeType.customEndTime, 'HH:mm').format('HH:mm');
      return payload;
    },
    async createNewSurcharge () {
      try {
        this.$v.newSurcharge.$touch();
        if (this.$v.newSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;

        const payload = this.getSurchargePayload(this.newSurcharge);
        await this.$surcharges.create(payload);
        NotifyPositive('Plan de majoration créé.');
        this.resetCreationSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du plan de majoration.');
      } finally {
        this.loading = false;
      }
    },
    openSurchargeEditionModal (id) {
      const selectedSurcharge = this.surcharges.find(surcharge => surcharge._id === id);
      const { _id, name, saturday, sunday, publicHoliday, twentyFifthOfDecember, firstOfMay,
        evening, eveningStartTime, eveningEndTime, custom, customStartTime, customEndTime,
      } = selectedSurcharge;
      this.editedSurcharge = {
        _id,
        name,
        saturday,
        sunday,
        publicHoliday,
        twentyFifthOfDecember,
        firstOfMay,
        evening,
        eveningStartTime: eveningStartTime ? this.$moment(eveningStartTime).format('HH:mm') : '',
        eveningEndTime: eveningEndTime ? this.$moment(eveningEndTime).format('HH:mm') : '',
        custom,
        customStartTime: customStartTime ? this.$moment(customStartTime).format('HH:mm') : '',
        customEndTime: customEndTime ? this.$moment(customEndTime).format('HH:mm') : '',
      };
      this.surchargeEditionModal = true;
    },
    resetEditionSurchargeData () {
      this.surchargeEditionModal = false;
      this.editedSurcharge = {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      };
      this.$v.editedSurcharge.$reset();
    },
    async updateSurcharge () {
      try {
        this.$v.editedSurcharge.$touch();
        if (this.$v.editedSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const surchargeId = this.editedSurcharge._id;
        const payload = this.getSurchargePayload(this.editedSurcharge);
        delete payload._id;
        delete payload.company;
        await this.$surcharges.updateById(surchargeId, payload);
        NotifyPositive('Plan de majoration modifié.');
        this.resetEditionSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification du plan de majoration.');
      } finally {
        this.loading = false;
      }
    },
    async deleteSurcharge (surchargeId, cell) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce plan de majoration ?',
          ok: 'OK',
          cancel: 'Annuler',
        }).onOk(async () => {
          await this.$surcharges.remove(surchargeId);
          this.surcharges.splice(cell, 1);
          NotifyPositive('Plan de majoration supprimé.');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du plan de majoration.');
      }
    },
    // Services
    formatCreatedService () {
      const { nature, name, defaultUnitAmount, type } = this.newService;
      const formattedService = {
        nature,
        versions: [{ name, defaultUnitAmount }],
        type,
      };
      if (this.newService.surcharge && this.newService.surcharge !== '') formattedService.versions[0].surcharge = this.newService.surcharge;
      if (this.newService.vat && this.newService.vat !== '') formattedService.versions[0].vat = this.newService.vat;
      return formattedService;
    },
    resetCreationServiceData () {
      this.serviceCreationModal = false;
      this.newService = {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: null,
        exemptFromCharges: false,
      };
      this.$v.newService.$reset();
    },
    async createNewService () {
      try {
        if (this.$v.newService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedService();
        await this.$services.create(payload);
        NotifyPositive('Service créé.');
        this.resetCreationServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service.');
      } finally {
        this.loading = false;
      }
    },
    openServiceEditionModal (id) {
      const selectedService = this.services.find(service => service._id === id);
      const { name, defaultUnitAmount, vat, surcharge, nature, exemptFromCharges } = selectedService;
      this.editedService = {
        _id: selectedService._id,
        name: name || '',
        startDate: '',
        defaultUnitAmount: defaultUnitAmount || '',
        vat: vat || '',
        nature,
        surcharge: surcharge ? surcharge._id : null,
        exemptFromCharges,
      };

      this.serviceEditionModal = true;
    },
    resetEditionServiceData () {
      this.serviceEditionModal = false;
      this.editedService = {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: null,
        exemptFromCharges: false,
      };
      this.$v.editedService.$reset();
    },
    async updateService () {
      try {
        if (this.$v.editedService.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const serviceId = this.editedService._id;
        const payload = this.$_.pickBy(this.editedService);
        delete payload._id;
        delete payload.nature;
        await this.$services.updateById(serviceId, payload);
        NotifyPositive('Service modifié');
        this.resetEditionServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification du service');
      } finally {
        this.loading = false;
      }
    },
    async deleteService (serviceId, cell) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce service ?',
          ok: 'OK',
          cancel: 'Annuler',
        }).onOk(async () => {
          await this.$services.remove(serviceId);
          this.services.splice(cell, 1);
          NotifyPositive('Service supprimé.');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    },
    showHistory (id) {
      this.selectedService = this.services.find(ser => ser._id === id);
      this.serviceHistoryModal = true;
    },
    resetServiceHistoryData () {
      this.serviceHistoryModal = false;
      this.selectedService = {};
    },
    // Third party payers
    openThirdPartyPayerEditionModal (thirdPartyPayerId) {
      this.thirdPartyPayerEditionModal = true;
      const currentThirdPartyPayer = this.thirdPartyPayers.find(thirdPartyPayer => thirdPartyPayer._id === thirdPartyPayerId);
      const { name, address, email, unitTTCRate, billingMode } = currentThirdPartyPayer;
      this.editedThirdPartyPayer = {
        _id: currentThirdPartyPayer._id,
        name,
        address: { ...address } || {},
        email,
        unitTTCRate,
        billingMode,
      };
    },
    resetThirdPartyPayerEditionData () {
      this.$v.newThirdPartyPayer.$reset();
      this.newThirdPartyPayer = {
        name: '',
        email: '',
        address: {},
        unitTTCRate: '',
        billingMode: '',
      }
    },
    formatThirdPartyPayerPayload (payload) {
      if (payload.address) {
        payload.address = this.$_.omit(payload.address, ['location']);
        if (!payload.address.fullAddress) payload.address = {};
      }
      return this.$_.pickBy(payload);
    },
    async createNewThirdPartyPayer () {
      try {
        if (this.$v.newThirdPartyPayer.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        this.newThirdPartyPayer.company = this.company._id;
        await this.$thirdPartyPayers.create(this.formatThirdPartyPayerPayload(this.newThirdPartyPayer));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur créé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du tiers payeur.');
      } finally {
        this.thirdPartyPayerCreationModal = false;
        this.loading = false;
      }
    },
    resetThirdPartyPayerUpdateModalData () {
      this.$v.editedThirdPartyPayer.$reset();
      this.editedThirdPartyPayer = {
        address: {},
      }
    },
    async updateThirdPartyPayer () {
      try {
        if (this.$v.editedThirdPartyPayer.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const thirdPartyPayerId = this.editedThirdPartyPayer._id;
        delete this.editedThirdPartyPayer._id;
        const payload = this.editedThirdPartyPayer;
        await this.$thirdPartyPayers.updateById(thirdPartyPayerId, this.formatThirdPartyPayerPayload(payload));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur modifié.');
      } catch (e) {
        NotifyNegative('Erreur lors de la modification du tiers payeur.');
        console.error(e);
      } finally {
        this.loading = false;
        this.thirdPartyPayerEditionModal = false;
      }
    },
    async deleteThirdPartyPayer (thirdPartyPayerId, cell) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Etes-vous sûr de vouloir supprimer ce tiers payeur ?',
          ok: 'OK',
          cancel: 'Annuler',
        }).onOk(async () => {
          await this.$thirdPartyPayers.removeById(thirdPartyPayerId);
          this.thirdPartyPayers.splice(cell, 1);
          NotifyPositive('Tiers payeur supprimé.');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du tiers payeur.');
      }
    },
    isTppUsedInFundings (tppIndex) {
      return this.thirdPartyPayers[tppIndex].isUsedInFundings;
    },
  },
}
</script>
