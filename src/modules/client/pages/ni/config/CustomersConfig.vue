<template>
  <q-page class="client-background" padding>
    <div v-if="company">
      <ni-title-header title="Configuration bénéficiaires" class="q-mb-xl" />
      <div class="q-mb-xl">
        <p class="text-weight-bold">Plans de majoration</p>
        <q-card>
          <ni-responsive-table :data="surcharges" :columns="surchargesColumns" v-model:pagination="pagination"
            :loading="surchargesLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="edit" @click="openSurchargeEditionModal(col.value)" />
                      <ni-button icon="delete" @click="validateSurchargeDeletion(col.value, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter un plan de majoration" @click="surchargeCreationModal = true"
              :disable="surchargesLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card>
          <ni-responsive-table :data="services" :columns="serviceColumns" v-model:pagination="pagination"
            :visible-columns="servicesVisibleColumns" :loading="servicesLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="history" @click="showHistory(col.value)" />
                      <ni-button v-if="!props.row.isArchived" icon="edit" @click="openServiceEditionModal(col.value)" />
                      <ni-button v-if="props.row.subscriptionCount === 0" icon="delete"
                        @click="validateServiceDeletion(col.value, props.row)" />
                      <ni-button v-else-if="!props.row.isArchived" icon="mdi-archive"
                        @click="validateServiceArchiving(col.value)" />
                      <div class="archived" v-else>archivé</div>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'billingItems'">
                    <div v-for="billingItem in col.value" :key="billingItem._id" class="billing-item-tag q-my-sm">
                      {{ billingItem.name }}
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter un service" @click="serviceCreationModal = true"
              :disable="servicesLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Articles de facturation</p>
        <q-card>
          <ni-responsive-table :data="billingItems" :columns="billingItemsColumns" v-model:pagination="pagination"
            :loading="billingItemsLoading">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <ni-button icon="delete" @click="validateBillingItemDeletion(col.value)" />
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter un article de facturation" :disable="billingItemsLoading"
              @click="billingItemCreationModal = true" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Mandat de prélèvement" path="customersConfig.templates.debitMandate"
              :entity="company" name="debitMandate" :url="docsUploadUrl" drive-storage
              @uploaded="documentUploaded" :additional-value="`modele_mandat_prelevement_${company.name}`"
              @delete="validateDocumentDeletion(
                company.customersConfig.templates.debitMandate.driveId,
                'debitMandate',
                'customersConfig'
              )" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" name="quote"
              @uploaded="documentUploaded" :additional-value="`modele_devis_${company.name}`" :url="docsUploadUrl"
              drive-storage :entity="company" @delete="validateDocumentDeletion(
                company.customersConfig.templates.quote.driveId,
                'quote',
                'customersConfig'
              )" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Conditions générales de services" path="customersConfig.templates.gcs"
              name="gcs" @uploaded="documentUploaded" :extensions="HTML_EXTENSIONS" drive-storage :entity="company"
              @delete="validateDocumentDeletion(company.customersConfig.templates.gcs.driveId,'gcs','customersConfig')"
              :additional-value="`gcs_${company.name}`" :url="docsUploadUrl" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Tiers payeurs</p>
        <q-card>
          <ni-responsive-table :data="thirdPartyPayers" :columns="thirdPartyPayersColumns" :loading="tppsLoading"
            v-model:pagination="pagination" :visible-columns="thirdPartyPayersVisibleColumns">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'billingMode'">
                    <div class="capitalize">{{ col.value }}</div>
                  </template>
                  <template v-else-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="remove_red_eye" @click="openThirdPartyPayerDetailsModal(col.value)" />
                      <ni-button icon="edit" @click="openThirdPartyPayerEditionModal(col.value)" />
                      <ni-button :disable="props.row.isUsedInFundings" icon="delete"
                        @click="validateTppDeletion(col.value, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <ni-button icon="add" label="Ajouter un tiers payeur" @click="thirdPartyPayerCreationModal = true"
              :disable="tppsLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Facturation</p>
          <ni-input caption="Pied de page sur la facture" v-model="company.customersConfig.billFooter" type="textarea"
            @focus="saveTmp('customersConfig.billFooter')" @blur="updateCompany('customersConfig.billFooter')" />
        <div class="row gutter-profile">
          <ni-select caption="Période de facturation par défaut" v-model="company.customersConfig.billingPeriod"
            @focus="saveTmp('customersConfig.billingPeriod')" @blur="updateCompany('customersConfig.billingPeriod')"
            :options="billingPeriodOptions" :error="v$.company.customersConfig.billingPeriod.$error" />
        </div>
      </div>
    </div>

    <surcharge-creation-modal v-model="surchargeCreationModal" v-model:new-surcharge="newSurcharge"
      :validations="v$.newSurcharge" @hide="resetCreationSurchargeData" @submit="createNewSurcharge"
      :loading="loading" />

    <surcharge-edition-modal v-model="surchargeEditionModal" v-model:edited-surcharge="editedSurcharge"
      :validations="v$.editedSurcharge" @hide="resetEditionSurchargeData" @submit="updateSurcharge"
      :loading="loading" />

    <service-creation-modal v-model="serviceCreationModal" v-model:new-service="newService" :validations="v$.newService"
      :nature-options="natureOptions" :default-unit-amount-error="nbrError('newService.defaultUnitAmount')"
      :surcharges-options="surchargesOptions" @hide="resetCreationServiceData" @submit="createNewService"
      :loading="loading" @add-billing-item="addBillingItemToService" @update-billing-item="updateBillingItemInService"
      @remove-billing-item="removeBillingItemInService" :billing-items-options="billingItemsOptions" />

    <service-edition-modal v-model="serviceEditionModal" v-model:edited-service="editedService" @submit="updateService"
      :default-unit-amount-error="nbrError('editedService.defaultUnitAmount')" :surcharges-options="surchargesOptions"
      @hide="resetEditionServiceData" :min-start-date="minStartDate" @add-billing-item="addBillingItemToService"
      @update-billing-item="updateBillingItemInService" :billing-items-options="billingItemsOptions" :loading="loading"
      :validations="v$.editedService" @remove-billing-item="removeBillingItemInService"
      :start-date-error="startDateError" />

    <billing-item-creation-modal v-model="billingItemCreationModal" v-model:new-billing-item="newBillingItem"
      :validations="v$.newBillingItem" :type-options="billingItemTypeOptions" :loading="loading"
      :default-unit-amount-error="nbrError('newBillingItem.defaultUnitAmount')" @hide="resetBillingItemCreation"
      :vat-error="nbrError('newBillingItem.vat')" @submit="createNewBillingItem" />

    <service-history-modal v-model="serviceHistoryModal" @hide="resetServiceHistoryData"
      :selected-service="selectedService" :service-columns="serviceColumns" />

    <third-party-payer-creation-modal v-model="thirdPartyPayerCreationModal" @update="setThirdPartyPayer"
      :validations="v$.newThirdPartyPayer" @hide="resetThirdPartyPayerCreation" @submit="createNewThirdPartyPayer"
      :loading="loading" :billing-mode-options="billingModeOptions" :new-third-party-payer="newThirdPartyPayer" />

    <third-party-payer-edition-modal v-model="thirdPartyPayerEditionModal" :validations="v$.editedThirdPartyPayer"
      :edited-third-party-payer="editedThirdPartyPayer" @submit="updateThirdPartyPayer" @update="setThirdPartyPayer"
      @hide="resetThirdPartyPayerEdition" :loading="loading" :billing-mode-options="billingModeOptions"
      :third-party-payer-type-options="TPP_TYPE_OPTIONS" />

    <third-party-payer-details-modal v-model="thirdPartyPayerDetailsModal" :third-party-payer="thirdPartyPayerDetail"
      :columns="thirdPartyPayersColumns" :visible-columns="thirdPartyPayerDetailsVisibleColumns" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required, numeric, requiredIf, email } from '@vuelidate/validators';
import capitalize from 'lodash/capitalize';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';
import set from 'lodash/set';
import compact from 'lodash/compact';
import uniq from 'lodash/uniq';
import get from 'lodash/get';
import omit from 'lodash/omit';
import Services from '@api/Services';
import BillingItems from '@api/BillingItems';
import Surcharges from '@api/Surcharges';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import FileUploader from '@components/form/FileUploader';
import TitleHeader from '@components/TitleHeader';
import Button from '@components/Button';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import ReponsiveTable from '@components/table/ResponsiveTable';
import {
  BILLING_DIRECT,
  BILLING_INDIRECT,
  TWO_WEEKS,
  MONTH,
  NATURE_OPTIONS,
  FIXED,
  COMPANY,
  REQUIRED_LABEL,
  HTML_EXTENSIONS,
  BILLING_ITEMS_TYPE_OPTIONS,
  PER_INTERVENTION,
  TPP_TYPE_OPTIONS,
} from '@data/constants';
import moment from '@helpers/moment';
import { roundFrenchPercentage, formatPrice, formatAndSortOptions, sortStrings, getLastVersion } from '@helpers/utils';
import { formatHoursWithMinutes } from '@helpers/date';
import { frAddress, positiveNumber, minDate, twoFractionDigits } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import ServiceCreationModal from 'src/modules/client/components/config/ServiceCreationModal';
import ServiceEditionModal from 'src/modules/client/components/config/ServiceEditionModal';
import BillingItemCreationModal from 'src/modules/client/components/config/BillingItemCreationModal';
import SurchargeCreationModal from 'src/modules/client/components/config/SurchargeCreationModal';
import SurchargeEditionModal from 'src/modules/client/components/config/SurchargeEditionModal';
import ThirdPartyPayerCreationModal from 'src/modules/client/components/config/ThirdPartyPayerCreationModal';
import ThirdPartyPayerEditionModal from 'src/modules/client/components/config/ThirdPartyPayerEditionModal';
import ThirdPartyPayerDetailsModal from 'src/modules/client/components/config/ThirdPartyPayerDetailsModal';
import ServiceHistoryModal from 'src/modules/client/components/config/ServiceHistoryModal';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'CustomersConfig',
  components: {
    'ni-file-uploader': FileUploader,
    'ni-title-header': TitleHeader,
    'ni-select': Select,
    'ni-button': Button,
    'ni-input': Input,
    'ni-responsive-table': ReponsiveTable,
    'service-creation-modal': ServiceCreationModal,
    'service-edition-modal': ServiceEditionModal,
    'billing-item-creation-modal': BillingItemCreationModal,
    'surcharge-creation-modal': SurchargeCreationModal,
    'surcharge-edition-modal': SurchargeEditionModal,
    'third-party-payer-creation-modal': ThirdPartyPayerCreationModal,
    'third-party-payer-edition-modal': ThirdPartyPayerEditionModal,
    'third-party-payer-details-modal': ThirdPartyPayerDetailsModal,
    'service-history-modal': ServiceHistoryModal,
  },
  setup () {
    const metaInfo = { title: 'Configuration bénéficiaire' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  mixins: [configMixin, validationMixin, tableMixin],
  watch: {
    'editedSurcharge.evening': function (value) {
      if (!value) {
        this.editedSurcharge.eveningStartTime = null;
        this.editedSurcharge.eveningEndTime = null;
      }
    },
    'editedSurcharge.custom': function (value) {
      if (!value) {
        this.editedSurcharge.customStartTime = null;
        this.editedSurcharge.customEndTime = null;
      }
    },
    'newSurcharge.evening': function (value) {
      if (!value) {
        this.newSurcharge.eveningStartTime = null;
        this.newSurcharge.eveningEndTime = null;
      }
    },
    'newSurcharge.custom': function (value) {
      if (!value) {
        this.newSurcharge.customStartTime = null;
        this.newSurcharge.customEndTime = null;
      }
    },
  },
  data () {
    return {
      loading: false,
      FIXED,
      COMPANY,
      REQUIRED_LABEL,
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
        firstOfJanuary: 0,
        firstOfMay: 0,
        twentyFifthOfDecember: 0,
        publicHoliday: 0,
        saturday: 0,
        sunday: 0,
        evening: 0,
        eveningStartTime: null,
        eveningEndTime: null,
        custom: 0,
        customStartTime: null,
        customEndTime: null,
      },
      editedSurcharge: {
        name: '',
        firstOfJanuary: 0,
        firstOfMay: 0,
        twentyFifthOfDecember: 0,
        publicHoliday: 0,
        saturday: 0,
        sunday: 0,
        evening: 0,
        eveningStartTime: null,
        eveningEndTime: null,
        custom: 0,
        customStartTime: null,
        customEndTime: null,
      },
      surchargesColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        {
          name: 'firstOfJanuary',
          label: '1er janvier',
          align: 'center',
          field: row => roundFrenchPercentage(row.firstOfJanuary, 0),
        },
        {
          name: 'firstOfMay',
          label: '1er mai',
          align: 'center',
          field: row => roundFrenchPercentage(row.firstOfMay, 0),
        },
        {
          name: 'twentyFifthOfDecember',
          label: '25 décembre',
          align: 'center',
          field: row => roundFrenchPercentage(row.twentyFifthOfDecember, 0),
        },
        {
          name: 'publicHoliday',
          label: 'Jour férié',
          align: 'center',
          field: row => roundFrenchPercentage(row.publicHoliday, 0),
        },
        { name: 'saturday', label: 'Samedi', align: 'center', field: row => roundFrenchPercentage(row.saturday, 0) },
        { name: 'sunday', label: 'Dimanche', align: 'center', field: row => roundFrenchPercentage(row.sunday, 0) },
        { name: 'evening', label: 'Soirée', align: 'center', field: row => roundFrenchPercentage(row.evening, 0) },
        {
          name: 'eveningStartTime',
          label: 'Début soirée',
          align: 'center',
          field: row => (row.eveningStartTime ? formatHoursWithMinutes(row.eveningStartTime) : ''),
        },
        {
          name: 'eveningEndTime',
          label: 'Fin soirée',
          align: 'center',
          field: row => (row.eveningEndTime ? formatHoursWithMinutes(row.eveningEndTime) : ''),
        },
        { name: 'custom', label: 'Perso', align: 'center', field: row => roundFrenchPercentage(row.custom, 0) },
        {
          name: 'customStartTime',
          label: 'Début perso',
          align: 'center',
          field: row => (row.customStartTime ? formatHoursWithMinutes(row.customStartTime) : ''),
        },
        {
          name: 'customEndTime',
          label: 'Fin perso',
          align: 'center',
          field: row => (row.customEndTime ? formatHoursWithMinutes(row.customEndTime) : ''),
        },
        { name: 'actions', label: '', align: 'center', field: '_id', style: 'padding-left: 0px' },
      ],
      surchargesLoading: false,
      // Services
      services: [],
      serviceCreationModal: false,
      serviceEditionModal: false,
      serviceHistoryModal: false,
      selectedService: {},
      newService: {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: '',
        exemptFromCharges: false,
        billingItems: [],
      },
      editedService: {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: '',
        exemptFromCharges: false,
      },
      natureOptions: NATURE_OPTIONS,
      servicesVisibleColumns: [
        'name',
        'nature',
        'defaultUnitAmount',
        'vat',
        'surcharge',
        'exemptFromCharges',
        'billingItems',
        'actions',
      ],
      serviceColumns: [
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: 'startDate',
          format: value => (value ? moment(value).format('DD/MM/YYYY') : ''),
        },
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = NATURE_OPTIONS.find(option => option.value === value);
            return nature ? capitalize(nature.label) : '';
          },
          field: 'nature',
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire TTC par défaut',
          align: 'center',
          field: 'defaultUnitAmount',
          format: formatPrice,
        },
        { name: 'vat', label: 'TVA', align: 'center', field: row => roundFrenchPercentage(row.vat, 1) },
        {
          name: 'surcharge',
          label: 'Plan de majoration',
          align: 'left',
          field: row => (row.surcharge ? row.surcharge.name : ''),
        },
        {
          name: 'exemptFromCharges',
          label: 'Exonération de charges',
          align: 'center',
          field: row => (row.exemptFromCharges ? 'Oui' : 'Non'),
        },
        {
          name: 'billingItems',
          label: 'Articles',
          field: (row) => {
            const billingItems = cloneDeep(row.billingItems);
            return billingItems.sort((a, b) => sortStrings(a.name, b.name));
          },
          align: 'center',
          style: !this.$q.platform.is.mobile && 'width: 200px',
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      servicesLoading: false,
      newBillingItem: { name: '', type: '', defaultUnitAmount: 0, vat: 0 },
      billingItemsLoading: false,
      billingItemCreationModal: false,
      billingItemTypeOptions: BILLING_ITEMS_TYPE_OPTIONS,
      billingItems: [],
      billingItemsColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        {
          name: 'type',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const type = BILLING_ITEMS_TYPE_OPTIONS.find(option => option.value === value);
            return type ? capitalize(type.label) : '';
          },
          field: 'type',
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire TTC par défaut',
          align: 'center',
          field: 'defaultUnitAmount',
          format: formatPrice,
        },
        { name: 'vat', label: 'TVA', align: 'center', field: row => roundFrenchPercentage(row.vat, 1) },
        { name: 'actions', label: '', align: 'right', field: '_id' },
      ],
      thirdPartyPayers: [],
      thirdPartyPayersColumns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          style: !this.$q.platform.is.mobile && 'width: 250px',
        },
        { name: 'address', label: 'Adresse', align: 'left', field: row => get(row, 'address.fullAddress') || '' },
        { name: 'email', label: 'Email', field: 'email', align: 'left' },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC par défaut',
          field: 'unitTTCRate',
          format: formatPrice,
          align: 'center',
        },
        {
          name: 'billingMode',
          label: 'Facturation',
          field: 'billingMode',
          align: 'center',
          format: (val) => {
            const mode = this.billingModeOptions.find(m => m.value === val);
            return mode ? mode.label : '';
          },
        },
        {
          name: 'teletransmissionId',
          label: 'ID de télétransmission',
          field: 'teletransmissionId',
          align: 'center',
          style: !this.$q.platform.is.mobile && 'word-break: break-word;',
        },
        {
          name: 'teletransmissionType',
          label: 'Type d\'aide',
          field: 'teletransmissionType',
          align: 'center',
          style: !this.$q.platform.is.mobile && 'word-break: break-word;',
        },
        {
          name: 'companyCode',
          label: 'Identifiant structure',
          field: 'companyCode',
          align: 'center',
          style: !this.$q.platform.is.mobile && 'word-break: break-word;',
        },
        {
          name: 'isApa',
          label: 'APA',
          field: 'isApa',
          align: 'center',
          format: val => (val ? 'Oui' : 'Non'),
          style: !this.$q.platform.is.mobile && 'width: 100px',
        },
        {
          name: 'actions',
          label: '',
          align: 'right',
          field: '_id',
        },
      ],
      thirdPartyPayersVisibleColumns: [
        'name',
        'address',
        'unitTTCRate',
        'billingMode',
        'teletransmissionId',
        'isApa',
        'actions',
      ],
      tppsLoading: false,
      thirdPartyPayerCreationModal: false,
      newThirdPartyPayer: {
        name: '',
        email: '',
        address: { fullAddress: '' },
        unitTTCRate: 0,
        billingMode: '',
        isApa: false,
        teletransmissionId: '',
      },
      billingModeOptions: [
        { label: 'Indirecte', value: BILLING_INDIRECT },
        { label: 'Directe', value: BILLING_DIRECT },
      ],
      thirdPartyPayerEditionModal: false,
      editedThirdPartyPayer: {
        address: {},
      },
      thirdPartyPayerDetailsModal: false,
      thirdPartyPayerDetailsVisibleColumns: [
        'name',
        'address',
        'email',
        'unitTTCRate',
        'billingMode',
        'teletransmissionId',
        'teletransmissionType',
        'companyCode',
        'isApa',
      ],
      thirdPartyPayerDetail: {
        address: {},
      },
      pagination: { rowsPerPage: 0 },
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      HTML_EXTENSIONS,
      TPP_TYPE_OPTIONS,
    };
  },
  validations () {
    return {
      newSurcharge: {
        name: { required },
        firstOfJanuary: { positiveNumber },
        firstOfMay: { positiveNumber },
        twentyFifthOfDecember: { positiveNumber },
        publicHoliday: { positiveNumber },
        saturday: { positiveNumber },
        sunday: { positiveNumber },
        evening: { positiveNumber },
        eveningStartTime: { required: requiredIf(this.newSurcharge.evening) },
        eveningEndTime: { required: requiredIf(this.newSurcharge.evening) },
        custom: { numeric },
        customStartTime: { required: requiredIf(this.newSurcharge.custom) },
        customEndTime: { required: requiredIf(this.newSurcharge.custom) },
      },
      editedSurcharge: {
        name: { required },
        firstOfJanuary: { positiveNumber },
        firstOfMay: { positiveNumber },
        twentyFifthOfDecember: { positiveNumber },
        publicHoliday: { positiveNumber },
        saturday: { positiveNumber },
        sunday: { positiveNumber },
        evening: { positiveNumber },
        eveningStartTime: { required: requiredIf(this.editedSurcharge.evening) },
        eveningEndTime: { required: requiredIf(this.editedSurcharge.evening) },
        custom: { numeric },
        customStartTime: { required: requiredIf(this.editedSurcharge.custom) },
        customEndTime: { required: requiredIf(this.editedSurcharge.custom) },
      },
      newService: {
        name: { required },
        nature: { required },
        defaultUnitAmount: { required, positiveNumber, twoFractionDigits },
        vat: { positiveNumber },
      },
      editedService: {
        name: { required },
        startDate: { required, minDate: this.minStartDate ? minDate(this.minStartDate) : '' },
        defaultUnitAmount: { required, positiveNumber, twoFractionDigits },
        vat: { positiveNumber },
      },
      newBillingItem: {
        name: { required },
        type: { required },
        defaultUnitAmount: { required, positiveNumber, twoFractionDigits },
        vat: { required, positiveNumber },
      },
      company: {
        customersConfig: {
          billingPeriod: { required },
        },
      },
      newThirdPartyPayer: {
        name: { required },
        address: {
          zipCode: { required: requiredIf(get(this.newThirdPartyPayer, 'address.fullAddress')) },
          street: { required: requiredIf(get(this.newThirdPartyPayer, 'address.fullAddress')) },
          city: { required: requiredIf(get(this.newThirdPartyPayer, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        email: { email },
        billingMode: { required },
        unitTTCRate: { positiveNumber, twoFractionDigits },
        isApa: { required },
      },
      editedThirdPartyPayer: {
        name: { required },
        address: {
          zipCode: { required: requiredIf(get(this.editedThirdPartyPayer, 'address.fullAddress')) },
          street: { required: requiredIf(get(this.editedThirdPartyPayer, 'address.fullAddress')) },
          city: { required: requiredIf(get(this.editedThirdPartyPayer, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        email: { email },
        billingMode: { required },
        unitTTCRate: { positiveNumber, twoFractionDigits },
        isApa: { required },
        teletransmissionType: { required: requiredIf(get(this.editedThirdPartyPayer, 'teletransmissionId')) },
        companyCode: { required: requiredIf(get(this.editedThirdPartyPayer, 'teletransmissionId')) },
      },
    };
  },
  computed: {
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    minStartDate () {
      const selectedService = this.services.find(ser => ser._id === this.editedService._id);
      return selectedService ? moment(selectedService.startDate).add(1, 'd').toISOString() : '';
    },
    billingItemsOptions () {
      return formatAndSortOptions(this.billingItems.filter(bi => bi.type === PER_INTERVENTION), 'name');
    },
    startDateError () {
      const val = get(this.v$, 'editedService.startDate');
      if (val.required.$response === false) return REQUIRED_LABEL;
      if (val.minDate.$response === false) {
        return 'La date d\'effet doit être postérieure à la date de la version précédente.';
      }

      return '';
    },
  },
  async mounted () {
    await Promise.all([
      this.refreshCompany(),
      this.refreshSurcharges(),
      this.refreshServices(),
      this.refreshThirdPartyPayers(),
      this.refreshBillingItems(),
    ]);
  },
  methods: {
    // Refresh data
    async refreshSurcharges () {
      try {
        this.surchargesLoading = true;
        this.surchargesOptions = [];
        this.surcharges = await Surcharges.list();
        for (let l = this.surcharges.length, i = 0; i < l; i++) {
          if (this.surcharges[i].eveningStartTime) {
            this.surcharges[i].eveningStartTime = moment(this.surcharges[i].eveningStartTime, 'HH:mm');
          }
          if (this.surcharges[i].eveningEndTime) {
            this.surcharges[i].eveningEndTime = moment(this.surcharges[i].eveningEndTime, 'HH:mm');
          }
          if (this.surcharges[i].customStartTime) {
            this.surcharges[i].customStartTime = moment(this.surcharges[i].customStartTime, 'HH:mm');
          }
          if (this.surcharges[i].customEndTime) {
            this.surcharges[i].customEndTime = moment(this.surcharges[i].customEndTime, 'HH:mm');
          }
          this.surchargesOptions.push({ label: this.surcharges[i].name, value: this.surcharges[i]._id });
        }
      } catch (e) {
        NotifyNegative('Erreur lors du rafraîchissement des plans de majoration.');
        console.error(e);
        this.surcharges = [];
      } finally {
        this.surchargesLoading = false;
      }
    },
    async refreshServices () {
      try {
        this.servicesLoading = true;
        const services = await Services.list();
        this.services = services
          .map(service => ({ ...getLastVersion(service.versions, 'startDate'), ...service }))
          .sort((a, b) => {
            if (a.isArchived && !b.isArchived) return 1;
            if (!a.isArchived && b.isArchived) return -1;
            return 0;
          });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du rafraîchissement des services.');
        this.services = [];
      } finally {
        this.servicesLoading = false;
      }
    },
    async refreshThirdPartyPayers () {
      try {
        this.tppsLoading = true;
        this.thirdPartyPayers = await ThirdPartyPayers.list();
      } catch (e) {
        this.thirdPartyPayers = [];
        console.error(e);
      } finally {
        this.tppsLoading = false;
      }
    },
    // Surcharges
    resetCreationSurchargeData () {
      this.newSurcharge = {
        name: '',
        firstOfJanuary: 0,
        firstOfMay: 0,
        twentyFifthOfDecember: 0,
        publicHoliday: 0,
        saturday: 0,
        sunday: 0,
        evening: 0,
        eveningStartTime: null,
        eveningEndTime: null,
        custom: 0,
        customStartTime: null,
        customEndTime: null,
      };
      this.v$.newSurcharge.$reset();
    },
    formatSurchargePayload (surcharge) {
      const payload = cloneDeep(surcharge);
      if (surcharge.eveningStartTime) {
        payload.eveningStartTime = moment(surcharge.eveningStartTime, 'HH:mm').format('HH:mm');
      }
      if (surcharge.eveningEndTime) {
        payload.eveningEndTime = moment(surcharge.eveningEndTime, 'HH:mm').format('HH:mm');
      }
      if (surcharge.customStartTime) {
        payload.customStartTime = moment(surcharge.customStartTime, 'HH:mm').format('HH:mm');
      }
      if (surcharge.customEndTime) {
        payload.customEndTime = moment(surcharge.customEndTime, 'HH:mm').format('HH:mm');
      }

      return omit(payload, ['_id', 'company']);
    },
    async createNewSurcharge () {
      try {
        this.v$.newSurcharge.$touch();
        if (this.v$.newSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;

        const payload = this.formatSurchargePayload(this.newSurcharge);
        await Surcharges.create(payload);
        NotifyPositive('Plan de majoration créé.');
        this.surchargeCreationModal = false;
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
      const { eveningStartTime, eveningEndTime, customStartTime, customEndTime } = selectedSurcharge;

      this.editedSurcharge = {
        ...pick(selectedSurcharge, ['_id', 'name']),
        firstOfJanuary: selectedSurcharge.firstOfJanuary || 0,
        firstOfMay: selectedSurcharge.firstOfMay || 0,
        publicHoliday: selectedSurcharge.publicHoliday || 0,
        saturday: selectedSurcharge.saturday || 0,
        sunday: selectedSurcharge.sunday || 0,
        twentyFifthOfDecember: selectedSurcharge.twentyFifthOfDecember || 0,
        evening: selectedSurcharge.evening || 0,
        custom: selectedSurcharge.custom || 0,
        eveningStartTime: eveningStartTime ? moment(eveningStartTime).format('HH:mm') : '',
        eveningEndTime: eveningEndTime ? moment(eveningEndTime).format('HH:mm') : '',
        customStartTime: customStartTime ? moment(customStartTime).format('HH:mm') : '',
        customEndTime: customEndTime ? moment(customEndTime).format('HH:mm') : '',
      };
      this.surchargeEditionModal = true;
    },
    resetEditionSurchargeData () {
      this.editedSurcharge = {
        name: '',
        firstOfJanuary: 0,
        firstOfMay: 0,
        twentyFifthOfDecember: 0,
        publicHoliday: 0,
        saturday: 0,
        sunday: 0,
        evening: 0,
        eveningStartTime: null,
        eveningEndTime: null,
        custom: 0,
        customStartTime: null,
        customEndTime: null,
      };
      this.v$.editedSurcharge.$reset();
    },
    async updateSurcharge () {
      try {
        this.v$.editedSurcharge.$touch();
        if (this.v$.editedSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatSurchargePayload(this.editedSurcharge);
        await Surcharges.updateById(this.editedSurcharge._id, payload);

        NotifyPositive('Plan de majoration modifié.');
        this.surchargeEditionModal = false;
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du plan de majoration.');
      } finally {
        this.loading = false;
      }
    },
    async deleteSurcharge (surchargeId, row) {
      try {
        const index = this.getRowIndex(this.surcharges, row);
        await Surcharges.remove(surchargeId);
        this.surcharges.splice(index, 1);
        NotifyPositive('Plan de majoration supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du plan de majoration.');
      }
    },
    validateSurchargeDeletion (surchargeId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce plan de majoration ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteSurcharge(surchargeId, row))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    formatCreatedService () {
      const { nature, name, defaultUnitAmount, exemptFromCharges, billingItems } = this.newService;
      const formattedService = {
        nature,
        versions: [{
          name,
          defaultUnitAmount,
          exemptFromCharges,
          // first version does not have actual start date
          startDate: moment('1970-01-01').startOf('d').toISOString(),
          billingItems: uniq(compact(billingItems)),
        }],
      };
      if (this.newService.surcharge && this.newService.surcharge !== '') {
        formattedService.versions[0].surcharge = this.newService.surcharge;
      }
      if (this.newService.vat && this.newService.vat !== '') formattedService.versions[0].vat = this.newService.vat;

      return formattedService;
    },
    resetCreationServiceData () {
      this.newService = {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: null,
        exemptFromCharges: false,
        billingItems: [],
      };
      this.v$.newService.$reset();
    },
    async createNewService () {
      try {
        this.v$.newService.$touch();
        if (this.v$.newService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedService();
        await Services.create(payload);

        NotifyPositive('Service créé.');
        this.serviceCreationModal = false;
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
      const { name, defaultUnitAmount, vat, surcharge, nature, exemptFromCharges, billingItems } = selectedService;
      this.editedService = {
        _id: selectedService._id,
        name: name || '',
        startDate: '',
        defaultUnitAmount: defaultUnitAmount || '',
        vat: vat || '',
        nature,
        surcharge: surcharge ? surcharge._id : null,
        exemptFromCharges,
        billingItems: billingItems.map(bi => bi._id) || [],
      };

      this.serviceEditionModal = true;
    },
    resetEditionServiceData () {
      this.editedService = {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: null,
        exemptFromCharges: false,
        billingItems: [],
      };
      this.v$.editedService.$reset();
    },
    formatEditedService () {
      return {
        ...pickBy(omit(this.editedService, ['_id', 'nature'])),
        billingItems: uniq(compact(this.editedService.billingItems)),
      };
    },
    async updateService () {
      try {
        this.v$.editedService.$touch();
        if (this.v$.editedService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatEditedService();
        await Services.updateById(this.editedService._id, payload);

        NotifyPositive('Service modifié');
        this.serviceEditionModal = false;
        await this.refreshServices();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du service.');
      } finally {
        this.loading = false;
      }
    },
    async deleteService (serviceId, row) {
      try {
        const index = this.getRowIndex(this.services, row);
        await Services.remove(serviceId);
        this.services.splice(index, 1);
        NotifyPositive('Service supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    },
    validateServiceDeletion (serviceId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce service ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteService(serviceId, row))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async archiveService (serviceId) {
      try {
        await Services.updateById(serviceId, { isArchived: true });
        NotifyPositive('Service archivé.');
        await this.refreshServices();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'archivage du service.');
      }
    },
    validateServiceArchiving (serviceId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir archiver ce service ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.archiveService(serviceId))
        .onCancel(() => NotifyPositive('Archivage annulé.'));
    },
    showHistory (id) {
      this.selectedService = this.services.find(ser => ser._id === id);
      this.serviceHistoryModal = true;
    },
    resetServiceHistoryData () {
      this.selectedService = {};
    },
    addBillingItemToService () {
      if (this.serviceCreationModal) this.newService.billingItems.push('');
      else if (this.serviceEditionModal) this.editedService.billingItems.push('');
    },
    updateBillingItemInService (index, event) {
      if (this.serviceCreationModal) set(this.newService.billingItems, index, event);
      else if (this.serviceEditionModal) set(this.editedService.billingItems, index, event);
    },
    removeBillingItemInService (index) {
      if (this.serviceCreationModal) this.newService.billingItems.splice(index, 1);
      else if (this.serviceEditionModal) this.editedService.billingItems.splice(index, 1);
    },
    // Billing Items
    resetBillingItemCreation () {
      this.v$.newBillingItem.$reset();
      this.newBillingItem = { name: '', type: '', defaultUnitAmount: 0, vat: 0 };
    },
    async createNewBillingItem () {
      try {
        this.v$.newBillingItem.$touch();
        if (this.v$.newBillingItem.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;

        await BillingItems.create(this.newBillingItem);

        NotifyPositive('Article de facturation créé.');
        this.billingItemCreationModal = false;
        await this.refreshBillingItems();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création de l\'article de facturation.');
      } finally {
        this.loading = false;
      }
    },
    async refreshBillingItems () {
      try {
        this.billingItemsLoading = true;
        this.billingItems = await BillingItems.list();
      } catch (e) {
        this.billingItems = [];
        console.error(e);
      } finally {
        this.billingItemsLoading = false;
      }
    },
    validateBillingItemDeletion (billingItemId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cet article de facturation ?',
        ok: 'OK',
        cancel: 'Annuler',
      })
        .onOk(() => this.deleteBillingItem(billingItemId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteBillingItem (id) {
      try {
        await BillingItems.remove(id);
        NotifyPositive('Article de facturation supprimé.');

        await this.refreshBillingItems();
      } catch (e) {
        console.error(e);
        if ([403, 409].includes(e.status)) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la suppression de l\'article de facturation.');
      }
    },
    // Third party payers
    getFormatedThirdPartyPayer (tppId) {
      const selectedTpp = this.thirdPartyPayers.find(tpp => tpp._id === tppId);
      const {
        _id,
        name,
        address,
        email: tppEmail,
        unitTTCRate,
        billingMode,
        isApa,
        teletransmissionId,
        teletransmissionType,
        companyCode,
      } = selectedTpp;

      return {
        _id,
        name: name || '',
        email: tppEmail || '',
        address: address || {},
        unitTTCRate: unitTTCRate || 0,
        billingMode: billingMode || '',
        isApa: isApa || false,
        teletransmissionId: teletransmissionId || '',
        teletransmissionType: teletransmissionType || '',
        companyCode: companyCode || '',
      };
    },
    openThirdPartyPayerDetailsModal (tppId) {
      this.thirdPartyPayerDetailsModal = true;
      this.thirdPartyPayerDetail = this.getFormatedThirdPartyPayer(tppId);
    },
    openThirdPartyPayerEditionModal (tppId) {
      this.thirdPartyPayerEditionModal = true;
      this.editedThirdPartyPayer = this.getFormatedThirdPartyPayer(tppId);
    },
    resetThirdPartyPayerCreation () {
      this.v$.newThirdPartyPayer.$reset();
      this.newThirdPartyPayer = {
        name: '',
        email: '',
        address: {},
        unitTTCRate: 0,
        billingMode: '',
        isApa: false,
        teletransmissionId: '',
      };
    },
    formatThirdPartyPayerPayload (tpp) {
      const payload = cloneDeep(tpp);
      if (payload.address && !payload.address.fullAddress) delete payload.address;

      return { isApa: false, ...pickBy(payload) };
    },
    setThirdPartyPayer (payload) {
      const { path, value } = payload;
      if (this.thirdPartyPayerCreationModal) set(this.newThirdPartyPayer, path, value);
      else if (this.thirdPartyPayerEditionModal) set(this.editedThirdPartyPayer, path, value);
    },
    async createNewThirdPartyPayer () {
      try {
        this.v$.newThirdPartyPayer.$touch();
        const formIsValid = await this.waitForFormValidation(this.v$.newThirdPartyPayer);
        if (!formIsValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await ThirdPartyPayers.create(this.formatThirdPartyPayerPayload(this.newThirdPartyPayer));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur créé.');
        this.thirdPartyPayerCreationModal = false;
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création du tiers payeur.');
      } finally {
        this.loading = false;
      }
    },
    resetThirdPartyPayerEdition () {
      this.v$.editedThirdPartyPayer.$reset();
      this.editedThirdPartyPayer = { address: {} };
    },
    async updateThirdPartyPayer () {
      try {
        this.v$.editedThirdPartyPayer.$touch();
        const formIsValid = await this.waitForFormValidation(this.v$.editedThirdPartyPayer);
        if (!formIsValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const thirdPartyPayerId = this.editedThirdPartyPayer._id;
        delete this.editedThirdPartyPayer._id;
        const payload = this.editedThirdPartyPayer;
        await ThirdPartyPayers.updateById(thirdPartyPayerId, this.formatThirdPartyPayerPayload(payload));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur modifié.');
        this.thirdPartyPayerEditionModal = false;
      } catch (e) {
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification du tiers payeur.');
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async deleteThirdPartyPayer (thirdPartyPayerId, row) {
      try {
        const index = this.getRowIndex(this.thirdPartyPayers, row);
        await ThirdPartyPayers.removeById(thirdPartyPayerId);
        this.thirdPartyPayers.splice(index, 1);
        NotifyPositive('Tiers payeur supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du tiers payeur.');
      }
    },
    validateTppDeletion (thirdPartyPayerId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce tiers payeur ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteThirdPartyPayer(thirdPartyPayerId, row))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
</script>

<style lang="sass" scoped>
.archived
  display: flex
  align-self: center
.billing-item-tag
  background-color: $copper-100
  border-radius: 8px
  color: $copper-700
</style>
