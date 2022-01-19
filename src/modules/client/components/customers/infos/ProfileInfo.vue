<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" v-model.trim="customer.identity.firstname" @focus="saveTmp('identity.firstname')"
          @blur="updateCustomer('identity.firstname')" />
        <ni-input caption="Nom" :error="v$.customer.identity.lastname.$error" v-model.trim="customer.identity.lastname"
          @focus="saveTmp('identity.lastname')" @blur="updateCustomer('identity.lastname')" />
        <ni-select caption="Civilité" :error="v$.customer.identity.title.$error" v-model="customer.identity.title"
          :options="civilityOptions" @focus="saveTmp('identity.title')" @blur="updateCustomer('identity.title')" />
        <ni-date-input v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')"
          caption="Date de naissance" @blur="updateCustomer('identity.birthDate')" content-class="col-xs-12 col-md-6" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-search-address v-model="customer.contact.primaryAddress" :error-message="primaryAddressError"
          :error="v$.customer.contact.primaryAddress.$error" caption="Adresse principale"
          @focus="saveTmp('contact.primaryAddress.fullAddress')" @blur="updateCustomer('contact.primaryAddress')" />
        <ni-search-address v-model="customer.contact.secondaryAddress" caption="Adresse secondaire"
          error-message="Adresse non valide" :error="v$.customer.contact.secondaryAddress.$error"
          @focus="saveTmp('contact.secondaryAddress.fullAddress')" @blur="updateCustomer('contact.secondaryAddress')" />
        <ni-input caption="Téléphone" type="tel" :error="v$.customer.contact.phone.$error"
          :error-message="'Numéro de téléphone non valide'" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-input caption="Compléments" v-model="customer.contact.others" @blur="updateCustomer('contact.others')"
          @focus="saveTmp('contact.others')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Souscriptions</p>
      <q-card>
        <ni-responsive-table :data="subscriptions" :columns="subscriptionsColumns" :loading="subscriptionsLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="history" @click="showHistory(col.value)" />
                    <ni-button @click="openSubscriptionEditionModal(col.value)" icon="edit"
                      :disable="get(props, 'row.service.isArchived') || false" />
                    <ni-button icon="delete" :disable="disableSubscriptionDeletion(props.row)"
                      @click="validateSubscriptionsDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button :disable="serviceOptions.length === 0 || subscriptionsLoading" icon="add"
            label="Ajouter une souscription" @click="openNewSubscriptionModal = true" />
        </q-card-actions>
      </q-card>
      <template v-if="subscriptions && subscriptions.length > 0">
        <div class="q-mt-md">
          <q-checkbox v-model="customer.subscriptionsAccepted" disable class="q-mr-sm" dense />
          <span style="vertical-align: middle">
            Validation en ligne des souscriptions
            <span class="text-weight-thin text-italic">{{ acceptedByHelper }}</span>
          </span>
        </div>
      </template>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <q-card>
        <ni-responsive-table :data="sortedHelpers" :columns="helpersColumns" :pagination="helpersPagination"
          :loading="helpersLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'referent'">
                  <q-radio v-model="referentHelper" :val="props.row._id" @update:model-value="updateReferentHelper" />
                </template>
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="edit" @click="openEditionModalHelper(col.value)" />
                    <ni-button icon="delete" @click="validateHelperDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button icon="add" label="Ajouter un(e) aidant(e)" @click="openNewHelperModal = true"
            :disable="helpersLoading" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input caption="Nom associé au compte bancaire" :error="v$.customer.payment.bankAccountOwner.$error"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')"
          @blur="updateCustomer('payment.bankAccountOwner')" />
        <ni-input caption="IBAN" :error="v$.customer.payment.iban.$error" :error-message="ibanError"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')" />
        <ni-input caption="BIC" :error="v$.customer.payment.bic.$error" :error-message="bicError"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mandats de prélèvement</p>
      </div>
      <q-card>
        <ni-responsive-table :columns="mandatesColumns" :data="customer.payment.mandates"
          class="mandate-table" :loading="mandatesLoading" v-model:pagination="pagination">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'emptyMandate'">
                  <ni-button v-if="customer.payment.mandates && getRowIndex(customer.payment.mandates, props.row) == 0"
                    @click="downloadMandate(props.row)" icon="file_download" />
                </template>
                <template v-else-if="col.name === 'signedMandate'">
                  <div v-if="!getDriveId(props.row)" class="row justify-center table-actions">
                    <q-uploader flat :url="docsUploadUrl" with-credentials :form-fields="mandateFormFields(props.row)"
                      field-name="file" auto-upload :accept="extensions" @uploaded="refreshMandates"
                      @failed="failMsg" />
                  </div>
                  <ni-button v-else @click="downloadDriveDoc(props.row)" icon="file_download"
                    :disable="docLoading || !getDriveId(props.row)" />
                </template>
                <template v-else-if="col.name === 'signedAt'">
                  <ni-date-input
                    v-model="customer.payment.mandates[getRowIndex(customer.payment.mandates, props.row)].signedAt"
                    @blur="updateSignedAt(props.row)"
                    @focus="saveTmpSignedAt(getRowIndex(customer.payment.mandates, props.row))" in-modal />
                </template>
                <template v-else-if="col.name === 'signed'">
                  <div :class="[{ 'dot dot-active': col.value, 'dot dot-error': !col.value }]" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <q-card>
        <ni-responsive-table :data="fundings" :columns="fundingsColumns" :visible-columns="fundingsVisibleColumns"
          :loading="fundingsLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="remove_red_eye" @click="showFundingDetails(col.value)" />
                    <ni-button icon="history" @click="showFundingHistory(col.value)" />
                    <ni-button icon="edit" @click="openFundingEditionModal(col.value)" />
                    <ni-button icon="delete" @click="validateFundingDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button :disable="fundingSubscriptionsOptions.length === 0 || fundingsLoading"
            icon="add" label="Ajouter un financement" @click="openFundingCreationModal" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-lg">
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-multiple-files-uploader path="financialCertificates" caption="Justificatif financement"
            @uploaded="documentUploaded" name="financialCertificates" collapsible-label="Ajouter un justificatif"
            :user-profile="customer" :url="docsUploadUrl" @delete="validateFinancialCertifDeletion($event)"
            additional-fields-name="financialCertificate" :extensions="extensions" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <ni-responsive-table :data="customer.quotes" :columns="quotesColumns" v-model:pagination="pagination"
          :loading="quotesLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'emptyQuote'">
                  <ni-button icon="file_download" color="primary" @click="downloadQuote(props.row)" />
                </template>
                <template v-else-if="col.name === 'signedQuote'">
                  <div v-if="!getDriveId(props.row)" class="row justify-center table-actions">
                    <q-uploader flat :url="docsUploadUrl" with-credentials :form-fields="quoteFormFields(props.row)"
                      field-name="file" :accept="extensions" auto-upload @uploaded="refreshQuotes" @failed="failMsg" />
                  </div>
                  <ni-button v-else @click="downloadDriveDoc(props.row)" icon="file_download"
                    :disable="docLoading || !getDriveId(props.row)" />
                </template>
                <template v-else-if="col.name === 'signed'">
                  <div :class="[{ 'dot dot-active': col.value, 'dot dot-error': !col.value }]" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button :disable="this.subscriptions.length === 0 || quotesLoading" icon="add" label="Générer un devis"
            @click="generateQuote" />
        </q-card-actions>
      </q-card>
    </div>

    <helper-creation-modal v-model="openNewHelperModal" :company="company" :loading="loading" @next-step="nextStep"
      v-model:new-helper="newHelper" @submit="createHelper" @hide="resetAddHelperForm" :validations="v$.newHelper"
      :first-step="firstStep" />

    <helper-edition-modal v-model:edited-helper="editedHelper" v-model="openEditedHelperModal" :loading="loading"
      :validations="v$.editedHelper" @hide="resetEditedHelperForm" @submit="editHelper" />

    <subscription-creation-modal v-model="openNewSubscriptionModal" v-model:new-subscription="newSubscription"
      :service-options="serviceOptions" :validations="v$.newSubscription" @hide="resetCreationSubscriptionData"
      :loading="loading" @submit="createSubscription" />

    <subscription-edition-modal v-model="openEditedSubscriptionModal" v-model:edited-subscription="editedSubscription"
      :validations="v$.editedSubscription" @hide="resetEditionSubscriptionData" :loading="loading"
      @submit="updateSubscription" />

    <subscription-history-modal v-model="subscriptionHistoryModal" :subscription="selectedSubscription"
      @hide="resetSubscriptionHistoryData" />

    <funding-details-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingDetailsModal"
      :funding="selectedFunding" @hide="resetFundingDetailsData" />

    <funding-history-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingHistoryModal"
      :funding="selectedFunding" @hide="resetFundingHistoryData" />

    <funding-creation-modal v-model="fundingCreationModal" v-model:new-funding="newFunding"
      :care-hours-error-message="careHoursErrorMessage(v$.newFunding)" @submit="createFunding" :loading="loading"
      :amount-ttc-error-message="amountTTCErrorMessage(v$.newFunding)" :validations="v$.newFunding"
      :unit-ttc-rate-error-message="unitTTCRateErrorMessage(v$.newFunding)" :days-options="daysOptions"
      :funding-subscriptions-options="fundingSubscriptionsOptions" @hide="resetCreationFundingData"
      :customer-participation-rate-error-message="customerParticipationRateErrorMessage(v$.newFunding)"
      :need-funding-plan-id-for-new-funding="needFundingPlanIdForNewFunding" :third-party-payers="ttpList" />

    <funding-edition-modal v-model="fundingEditionModal" :loading="loading" @hide="resetEditionFundingData"
      v-model:edited-funding="editedFunding" @submit="editFunding" :days-options="daysOptions"
      :validations="v$.editedFunding" :care-hours-error-message="careHoursErrorMessage(v$.editedFunding)"
      :amount-ttc-error-message="amountTTCErrorMessage(v$.editedFunding)"
      :unit-ttc-rate-error-message="unitTTCRateErrorMessage(v$.editedFunding)"
      :customer-participation-rate-error-message="customerParticipationRateErrorMessage(v$.editedFunding)"
      :need-funding-plan-id-for-edited-funding="needFundingPlanIdForEditedFunding" />
</div>
</template>

<script>
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf, email } from '@vuelidate/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import Services from '@api/Services';
import Customers from '@api/Customers';
import GoogleDrive from '@api/GoogleDrive';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import SearchAddress from '@components/form/SearchAddress';
import Button from '@components/Button';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import MultipleFilesUploader from '@components/form/MultipleFilesUploader';
import DateInput from '@components/form/DateInput';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { days } from '@data/days';
import {
  FIXED,
  HOURLY,
  MONTHLY,
  REQUIRED_LABEL,
  CIVILITY_OPTIONS,
  DOC_EXTENSIONS,
  ONCE,
} from '@data/constants';
import { downloadDriveDocx } from '@helpers/file';
import { formatDate } from '@helpers/date';
import { getLastVersion } from '@helpers/utils';
import { frPhoneNumber, iban, bic, frAddress, minDate } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';
import { getSubscriptionQuoteTags, getQuoteTags, getMandateTags } from 'src/modules/client/helpers/tags';
import { userMixin } from '@mixins/userMixin';
import { validationMixin } from '@mixins/validationMixin';
import HelperEditionModal from 'src/modules/client/components/customers/infos/HelperEditionModal';
import HelperCreationModal from 'src/modules/client/components/customers/infos/HelperCreationModal';
import SubscriptionCreationModal from 'src/modules/client/components/customers/infos/SubscriptionCreationModal';
import SubscriptionEditionModal from 'src/modules/client/components/customers/infos/SubscriptionEditionModal';
import SubscriptionHistoryModal from 'src/modules/client/components/customers/infos/SubscriptionHistoryModal';
import FundingDetailsModal from 'src/modules/client/components/customers/infos/FundingDetailsModal';
import FundingHistoryModal from 'src/modules/client/components/customers/infos/FundingHistoryModal';
import FundingEditionModal from 'src/modules/client/components/customers/infos/FundingEditionModal';
import FundingCreationModal from 'src/modules/client/components/customers/infos/FundingCreationModal';
import { financialCertificatesMixin } from 'src/modules/client/mixins/financialCertificatesMixin';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { customerMixin } from 'src/modules/client/mixins/customerMixin';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';
import { helperMixin } from 'src/modules/client/mixins/helperMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'ProfileInfo',
  components: {
    'ni-search-address': SearchAddress,
    'ni-button': Button,
    'ni-input': Input,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'helper-creation-modal': HelperCreationModal,
    'helper-edition-modal': HelperEditionModal,
    'subscription-creation-modal': SubscriptionCreationModal,
    'subscription-edition-modal': SubscriptionEditionModal,
    'subscription-history-modal': SubscriptionHistoryModal,
    'funding-details-modal': FundingDetailsModal,
    'funding-history-modal': FundingHistoryModal,
    'funding-creation-modal': FundingCreationModal,
    'funding-edition-modal': FundingEditionModal,
    'ni-responsive-table': ResponsiveTable,
  },
  setup () { return { v$: useVuelidate() }; },
  mixins: [
    customerMixin,
    subscriptionMixin,
    financialCertificatesMixin,
    fundingMixin,
    validationMixin,
    helperMixin,
    tableMixin,
    userMixin,
  ],
  data () {
    return {
      FIXED,
      days,
      loading: false,
      openEditedHelperModal: false,
      openNewSubscriptionModal: false,
      openEditedSubscriptionModal: false,
      civilityOptions: CIVILITY_OPTIONS,
      isLoaded: false,
      tmpInput: '',
      subscriptions: [],
      services: [],
      quotesColumns: [
        { name: 'quoteNumber', label: 'Numéro du devis', align: 'left', field: 'quoteNumber' },
        { name: 'emptyQuote', label: 'Devis', align: 'center' },
        { name: 'signedQuote', label: 'Devis signé', align: 'center' },
        { name: 'signed', label: 'Signé', align: 'center', field: row => row.drive && row.drive.driveId },
      ],
      quotesLoading: false,
      newSubscription: {
        service: '',
        unitTTCRate: 0,
        estimatedWeeklyVolume: '',
      },
      editedSubscription: {},
      mandatesColumns: [
        { name: 'rum', label: 'RUM', align: 'left', field: 'rum' },
        { name: 'emptyMandate', label: 'Mandat', align: 'center' },
        { name: 'signedMandate', label: 'Mandat signé', align: 'center' },
        { name: 'signed', label: 'Signé', align: 'center', field: 'signedAt' },
        { name: 'signedAt', label: 'Date de signature', align: 'left', field: 'signedAt' },
      ],
      mandatesLoading: false,
      fundingsVisibleColumns: ['thirdPartyPayer', 'folderNumber', 'nature', 'startDate', 'endDate', 'actions'],
      fundingHistoryModal: false,
      paginationFundingHistory: {
        rowsPerPage: 0,
        sortBy: 'createdAt',
        descending: true,
      },
      ttpList: [],
      newFunding: {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: MONTHLY,
        endDate: '',
        nature: HOURLY,
        amountTTC: null,
        unitTTCRate: null,
        careHours: null,
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
        fundingPlanId: '',
      },
      fundingCreationModal: false,
      fundingEditionModal: false,
      fundingDetailsModal: false,
      selectedFunding: {},
      editedFunding: {},
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
      extensions: DOC_EXTENSIONS,
      firstStep: true,
      docLoading: false,
    };
  },
  computed: {
    ...mapState('customer', ['customer']),
    customerIdentity () {
      const firstname = get(this.customer, 'identity.firstname');
      const lastname = get(this.customer, 'identity.lastname');
      return firstname ? `${firstname}_${lastname}` : lastname;
    },
    docsUploadUrl () {
      if (!this.customer.driveFolder) return '';

      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}`
        + '/upload';
    },
    company () {
      return this.$store.getters['main/getCompany'];
    },
    serviceOptions () {
      if (!this.services) return [];

      const subscribedServices = this.subscriptions.map(subscription => get(subscription, 'service._id'));
      const availableServices = this.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: getLastVersion(service.versions, 'createdAt').name,
        value: { _id: service._id, nature: service.nature },
      }));
    },
    primaryAddressError () {
      if (this.v$.customer.contact.primaryAddress.fullAddress.required.$response === false) return REQUIRED_LABEL;

      return 'Adresse non valide';
    },
    ibanError () {
      if (this.v$.customer.payment.iban.required.$response === false) return REQUIRED_LABEL;
      if (this.v$.customer.payment.iban.iban.$response === false) return 'IBAN non valide';

      return '';
    },
    bicError () {
      if (this.v$.customer.payment.bic.required.$response === false) return REQUIRED_LABEL;
      if (this.v$.customer.payment.bic.bic.$response === false) return 'BIC non valide';

      return '';
    },
    acceptedByHelper () {
      return this.lastSubscriptionHistory && this.customer.subscriptionsAccepted
        ? `le ${formatDate(this.lastSubscriptionHistory.approvalDate)} par ${this.acceptedBy}`
        : '';
    },
    fundingSubscriptionsOptions () {
      return this.subscriptions
        .filter(sub => get(sub, 'service.nature') !== FIXED)
        .map(sub => ({ label: get(sub, 'service.name'), value: sub._id }));
    },
    daysOptions () {
      return days.map((day, i) => ({ label: day !== 'Jours fériés' ? day.slice(0, 2) : day, value: i }));
    },
    needFundingPlanIdForNewFunding () {
      const thirdPartyPayer = this.ttpList.find(ttp => ttp._id === this.newFunding.thirdPartyPayer);

      return !!get(thirdPartyPayer, 'teletransmissionId');
    },
    needFundingPlanIdForEditedFunding () {
      return !!get(this.editedFunding, 'thirdPartyPayer.teletransmissionId');
    },
  },
  validations () {
    return {
      customer: {
        identity: {
          lastname: { required },
          title: { required },
        },
        contact: {
          phone: { frPhoneNumber },
          primaryAddress: {
            zipCode: { required },
            street: { required },
            city: { required },
            fullAddress: { required, frAddress },
          },
          secondaryAddress: {
            zipCode: { required: requiredIf(get(this.customer, 'contact.secondaryAddress.fullAddress')) },
            street: { required: requiredIf(get(this.customer, 'contact.secondaryAddress.fullAddress')) },
            city: { required: requiredIf(get(this.customer, 'contact.secondaryAddress.fullAddress')) },
            fullAddress: { frAddress },
          },
        },
        payment: {
          bankAccountOwner: { required },
          bic: { required, bic },
          iban: { required, iban },
        },
      },
      newHelper: {
        contact: { phone: { frPhoneNumber } },
        identity: { lastname: { required } },
        local: { email: { required, email } },
      },
      editedHelper: {
        contact: { phone: { frPhoneNumber } },
        identity: { lastname: { required } },
        local: { email: { required, email } },
      },
      newSubscription: {
        service: { required },
        unitTTCRate: { required },
        estimatedWeeklyVolume: { required },
      },
      editedSubscription: {
        unitTTCRate: { required },
        estimatedWeeklyVolume: { required },
      },
      newFunding: {
        thirdPartyPayer: { required },
        subscription: { required },
        nature: { required },
        frequency: { required },
        ...this.getFundingValidation(this.newFunding),
        fundingPlanId: { required: requiredIf(this.needFundingPlanIdForNewFunding) },

      },
      editedFunding: {
        ...this.getFundingValidation(this.editedFunding),
        fundingPlanId: { required: requiredIf(this.needFundingPlanIdForEditedFunding) },
      },
    };
  },
  watch: {
    'newFunding.thirdPartyPayer': function () {
      if (this.newFunding.nature === HOURLY) this.setHourlyUnitUTTRate();
      if (!this.needFundingPlanIdForNewFunding) this.newFunding.fundingPlanId = '';
    },
    'newFunding.nature': function (newNature) {
      if (newNature === FIXED) {
        this.newFunding.frequency = ONCE;
        this.newFunding.unitTTCRate = null;
        this.newFunding.careHours = null;
        this.newFunding.customerParticipationRate = null;
      } else {
        this.setHourlyUnitUTTRate();
        this.newFunding.amountTTC = null;
      }
    },
  },
  async mounted () {
    await Promise.all([this.getUserHelpers(), this.refreshCustomer(), this.getServices()]);
    this.isLoaded = true;
  },
  methods: {
    get,
    disableSubscriptionDeletion (sub) {
      const hasFunding = this.fundings.some(f => f.subscription._id === sub._id);

      return sub.eventCount > 0 || sub.repetitionCount > 0 || hasFunding;
    },
    getFundingValidation (funding) {
      return {
        amountTTC: {
          required: requiredIf(funding.nature === FIXED),
          minValue: value => (funding.nature === FIXED ? value > 0 : value == null),
        },
        unitTTCRate: {
          required: requiredIf(funding.nature === HOURLY),
          minValue: value => (funding.nature === HOURLY ? value > 0 : value == null),
        },
        careHours: {
          required: requiredIf(funding.nature === HOURLY),
          minValue: value => (funding.nature === HOURLY ? value > 0 : value == null),

        },
        careDays: { required },
        startDate: { required },
        endDate: { minDate: minDate(funding.startDate) },
        customerParticipationRate: {
          required: requiredIf(funding.nature === HOURLY),
          minValue: value => (funding.nature === HOURLY ? value >= 0 : value == null),
          maxValue: value => (funding.nature === HOURLY ? value < 100 : value == null),
        },
      };
    },
    careHoursErrorMessage (validations) {
      if (get(validations, 'careHours.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'careHours.minValue.$response') === false) return 'Nombre d\'heures invalide';
      return '';
    },
    amountTTCErrorMessage (validations) {
      if (get(validations, 'amountTTC.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'amountTTC.minValue.$response') === false) return 'Montant forfaitaire TTC invalide';
      return '';
    },
    unitTTCRateErrorMessage (validations) {
      if (get(validations, 'unitTTCRate.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'unitTTCRate.minValue.$response') === false) return 'Prix unitaire TTC invalide';
      return '';
    },
    customerParticipationRateErrorMessage (validations) {
      if (get(validations, 'customerParticipationRate.required.$response') === false) return REQUIRED_LABEL;
      if (get(validations, 'customerParticipationRate.minValue.$response') === false ||
        get(validations, 'customerParticipationRate.maxValue.$response') === false) {
        return 'Taux de participation invalide';
      }
      return '';
    },
    mandateFormFields (row) {
      return [
        { name: 'mandateId', value: row._id },
        { name: 'fileName', value: `mandat_signe_${this.customerIdentity}` },
        { name: 'type', value: 'signedMandate' },
      ];
    },
    quoteFormFields (quote) {
      return [
        { name: 'quoteId', value: quote._id },
        { name: 'fileName', value: `devis_signe_${this.customerIdentity}` },
        { name: 'type', value: 'signedQuote' },
      ];
    },
    saveTmp (path) {
      this.tmpInput = get(this.customer, path);
    },
    saveTmpSignedAt (index) {
      this.tmpInput = this.customer.payment.mandates[index].signedAt;
    },
    // Refresh data
    async getServices () {
      try {
        this.services = await Services.list({ isArchived: false });
      } catch (e) {
        console.error(e);
        this.services = [];
      }
    },
    async refreshMandates () {
      try {
        this.mandatesLoading = true;
        const mandates = await Customers.getMandates(this.customer._id);

        this.$store.dispatch(
          'customer/setCustomer',
          { ...this.customer, payment: { ...this.customer.payment, mandates } }
        );
        this.v$.customer.$touch();
      } catch (e) {
        console.error(e);
      } finally {
        this.mandatesLoading = false;
      }
    },
    async refreshQuotes () {
      try {
        this.quotesLoading = true;
        const quotes = await Customers.getQuotes(this.customer._id);

        this.$store.dispatch('customer/setCustomer', { ...this.customer, quotes });
        this.v$.customer.$touch();
      } catch (e) {
        console.error(e);
      } finally {
        this.quotesLoading = false;
      }
    },
    async refreshCustomer () {
      await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customer._id });
      await this.refreshSubscriptions(this.customer);
      await this.refreshFundings(this.customer);

      this.$store.dispatch(
        'customer/setCustomer',
        { ...this.customer, subscriptions: [...this.subscriptions], fundings: [...this.fundings] }
      );
      this.v$.customer.$touch();
    },
    // Subscriptions
    formatCreatedSubscription () {
      const { service, unitTTCRate, estimatedWeeklyVolume, sundays, evenings } = this.newSubscription;
      const formattedService = { service: service._id, versions: [{ unitTTCRate, estimatedWeeklyVolume }] };

      if (sundays) formattedService.versions[0].sundays = sundays;
      if (evenings) formattedService.versions[0].evenings = evenings;

      return formattedService;
    },
    resetCreationSubscriptionData () {
      this.v$.newSubscription.$reset();
      this.newSubscription = {
        service: '',
        unitTTCRate: 0,
        estimatedWeeklyVolume: '',
      };
    },
    async createSubscription () {
      try {
        this.v$.newSubscription.$touch();
        if (this.v$.newSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedSubscription();
        await Customers.addSubscription(this.customer._id, payload);
        await this.refreshCustomer();
        this.openNewSubscriptionModal = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de la souscription.');
      } finally {
        this.loading = false;
      }
    },
    openSubscriptionEditionModal (id) {
      const selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      const { _id, service, unitTTCRate, estimatedWeeklyVolume, evenings, sundays } = selectedSubscription;
      this.editedSubscription = {
        _id,
        nature: service.nature,
        unitTTCRate: unitTTCRate || 0,
        estimatedWeeklyVolume: estimatedWeeklyVolume || 0,
        evenings: evenings || 0,
        sundays: sundays || 0,
      };

      this.openEditedSubscriptionModal = true;
    },
    resetEditionSubscriptionData () {
      this.editedSubscription = {};
      this.v$.editedSubscription.$reset();
    },
    async updateSubscription () {
      try {
        this.v$.editedSubscription.$touch();
        if (this.v$.editedSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const subscriptionId = this.editedSubscription._id;
        const payload = omit(this.editedSubscription, ['_id', 'nature']);
        await Customers.updateSubscription({ _id: this.customer._id, subscriptionId }, payload);

        this.refreshCustomer();
        this.openEditedSubscriptionModal = false;
        NotifyPositive('Souscription modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la souscription.');
      } finally {
        this.loading = false;
      }
    },
    async deleteSubscriptions (subscriptionId) {
      try {
        await Customers.removeSubscription({ subscriptionId, _id: this.customer._id });
        await this.refreshCustomer();
        NotifyPositive('Souscription supprimée');
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative(e.data.message);
        return NotifyNegative('Erreur lors de la suppression de la souscription.');
      }
    },
    validateSubscriptionsDeletion (subscriptionId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette souscription ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteSubscriptions(subscriptionId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    // Mandates
    async updateSignedAt (mandate) {
      try {
        if (!mandate.signedAt || this.tmpInput === mandate.signedAt) return;
        const params = { _id: this.customer._id, mandateId: mandate._id };
        await Customers.updateMandate(params, mandate);

        this.refreshMandates();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      }
    },
    async downloadMandate (mandate) {
      try {
        const mandateDriveId = get(this.company, 'customersConfig.templates.debitMandate.driveId', null);
        if (!mandateDriveId) {
          return NotifyWarning('Template manquant');
        }

        const data = getMandateTags(this.customer, this.company, mandate);
        const params = { driveId: mandateDriveId };

        await downloadDriveDocx(params, data, 'mandat.docx');
        NotifyPositive('Mandat téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du mandat.');
      }
    },
    // Documents
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document.');
    },
    getDriveId (doc) {
      return get(doc, 'drive.driveId') || '';
    },
    async downloadDriveDoc (doc) {
      if (this.docLoading) return;
      try {
        this.docLoading = true;
        await GoogleDrive.downloadFileById(this.getDriveId(doc));
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
      }
    },
    // Quotes
    async downloadQuote (quote) {
      try {
        const quoteDriveId = get(this.company, 'customersConfig.templates.quote.driveId', null);
        if (!quoteDriveId) return NotifyWarning('Template manquant');

        const subscriptions = quote.subscriptions.map(subscription => ({
          ...subscription,
          estimatedWeeklyRate: this.computeWeeklyRate(subscription),
        }));

        const data = getQuoteTags(this.customer, this.company, { ...quote, subscriptions });
        const params = { driveId: quoteDriveId };
        await downloadDriveDocx(params, data, 'devis.docx');
        NotifyPositive('Devis téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du devis.');
      }
    },
    async generateQuote () {
      try {
        const payload = { subscriptions: this.subscriptions.map(getSubscriptionQuoteTags) };
        await Customers.addQuote(this.customer._id, payload);

        await this.refreshQuotes();
        NotifyPositive('Devis généré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la génération du devis.');
      }
    },
    // Fundings
    setHourlyUnitUTTRate () {
      const ttp = this.ttpList.find(p => p._id === this.newFunding.thirdPartyPayer);
      this.newFunding.unitTTCRate = ttp ? ttp.unitTTCRate : null;
    },
    async getThirdPartyPayers () {
      try {
        this.ttpList = await ThirdPartyPayers.list();
      } catch (e) {
        this.ttpList = [];
        console.error(e);
      }
    },
    async openFundingCreationModal () {
      await this.getThirdPartyPayers();
      this.fundingCreationModal = true;
    },
    showFundingHistory (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingHistoryModal = true;
    },
    resetFundingHistoryData () {
      this.selectedFunding = {};
    },
    resetCreationFundingData () {
      this.v$.newFunding.$reset();
      this.newFunding = {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: MONTHLY,
        endDate: '',
        nature: HOURLY,
        amountTTC: null,
        unitTTCRate: null,
        careHours: null,
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
        fundingPlanId: '',
      };
    },
    formatCreatedFunding () {
      const cleanPayload = pickBy(this.newFunding);
      if (this.newFunding.nature === HOURLY && !this.newFunding.customerParticipationRate) {
        cleanPayload.customerParticipationRate = 0;
      }
      const { nature, thirdPartyPayer, subscription, frequency, ...version } = cleanPayload;
      if (version.endDate) version.endDate = moment(version.endDate).endOf('d').toDate();

      return { nature, thirdPartyPayer, subscription, frequency, versions: [{ ...version }] };
    },
    async createFunding () {
      try {
        this.v$.newFunding.$touch();
        if (this.v$.newFunding.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedFunding();
        await Customers.addFunding(this.customer._id, payload);

        this.fundingCreationModal = false;
        await this.refreshCustomer();
        NotifyPositive('Financement ajoutée');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout d\'un financement.');
      } finally {
        this.loading = false;
      }
    },
    async deleteFunding (fundingId) {
      try {
        const params = { fundingId, _id: this.customer._id };
        await Customers.removeFunding(params);
        await this.refreshCustomer();
        NotifyPositive('Financement supprimé');
      } catch (e) {
        console.error(e);
      }
    },
    validateFundingDeletion (fundingId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce financement ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteFunding(fundingId))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    showFundingDetails (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingDetailsModal = true;
    },
    resetFundingDetailsData () {
      this.selectedFunding = {};
    },
    openFundingEditionModal (id) {
      this.editedFunding = { ...this.fundings.find(fund => fund._id === id) };
      this.editedFunding.subscription = this.editedFunding.subscription._id;
      this.fundingEditionModal = true;
    },
    resetEditionFundingData () {
      this.editedFunding = {};
      this.v$.editedFunding.$reset();
    },
    formatFundingEditionPayload (funding) {
      const pickedFields = ['folderNumber', 'careDays', 'startDate', 'subscription', 'fundingPlanId'];
      if (funding.nature === FIXED) pickedFields.push('amountTTC');
      else if (funding.nature === HOURLY) pickedFields.push('unitTTCRate', 'careHours', 'customerParticipationRate');

      return { ...pick(funding, pickedFields), endDate: funding.endDate ? moment(funding.endDate).endOf('d') : '' };
    },
    async editFunding () {
      try {
        this.v$.editedFunding.$touch();
        if (this.v$.editedFunding.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;

        const payload = this.formatFundingEditionPayload(this.editedFunding);
        await Customers.updateFunding({ _id: this.customer._id, fundingId: this.editedFunding._id }, payload);

        this.fundingEditionModal = false;
        await this.refreshCustomer();
        NotifyPositive('Financement modifié');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification d\'un financement.');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.table-actions > .q-btn__wrapper
  padding: 0

a
  color: $primary
  text-decoration: none

.mandate-table
  td
    word-break: break-all

@media screen and (min-width: 768px)
  .dot
    margin: 0px

.signedAt
  :deep(.q-field--with-bottom)
    padding: 0
  :deep(.q-field__bottom)
    display: none
</style>
