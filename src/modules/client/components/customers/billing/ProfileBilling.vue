<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p data-cy="customer-identity" class="text-weight-bold text-primary">
          {{ formatIdentity(this.customer.identity,'FL') }}
        </p>
        <ni-date-range v-model="billingDates" @blur="refresh" />
      </div>
      <div v-if="isHelper && company.billingAssistance" class="message">
        Si vous souhaitez obtenir une facture non disponible sur cette page, adressez un email à
        <a :href="'mailto:' + company.billingAssistance"> {{ company.billingAssistance }}</a>.
      </div>
      <ni-customer-billing-table :documents="customerDocuments" :billing-dates="billingDates" :type="CUSTOMER"
        @open-edition-modal="openEditionModal" :start-balance="getStartBalance()" :loading="tableLoading"
        :end-balance="getEndBalance(customerDocuments)" :display-actions="isAdmin && !isArchived"
        @delete="validateRefundDeletion($event, taxCertificates)" />
      <div v-if="isAdmin" class="q-mt-md" align="right">
        <ni-button class="add-payment" label="Ajouter un réglement" @click="openPaymentCreationModal(customer)"
          color="white" icon="add" :disable="isArchived" />
      </div>
    </div>
    <div class="q-pa-sm q-mb-lg" v-for="tpp in tppDocuments" :key="tpp._id">
      <p data-cy="tpp-identity" class="text-weight-bold text-primary">{{ tpp.name }}</p>
      <ni-customer-billing-table :documents="tpp.documents" :billing-dates="billingDates"
        @open-edition-modal="openEditionModal" :type="THIRD_PARTY_PAYER" :start-balance="getStartBalance(tpp)"
        :end-balance="getEndBalance(tpp.documents, tpp)" :loading="tableLoading" @delete="validateRefundDeletion"
        :display-actions="isAdmin && !isArchived" />
      <div v-if="isAdmin" class="q-mt-md" align="right">
        <ni-button class="add-payment" label="Ajouter un réglement" color="white" icon="add" :disable="isArchived"
          @click="openPaymentCreationModal(customer, tpp.documents[0].thirdPartyPayer)" />
      </div>
    </div>
    <div class="q-pa-sm q-mb-lg">
      <p class="text-weight-bold text-primary">Attestations fiscales</p>
      <ni-simple-table :data="taxCertificates" :columns="taxCertificatesColumns" :loading="tableLoading"
        v-model:pagination="taxCertificatesPagination">
        <template #body="{ props }">
          <q-tr data-cy="tax-certificate" :props="props">
            <q-td :props="props" v-for="col in props.cols" :key="col.name" :data-label="col.label" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row justify-center table-actions">
                  <ni-button v-if="get(props, 'row.driveFile.driveId')" data-cy="link" color="primary"
                    @click="downloadTaxCertificateFromDrive(props.row)" icon="file_download" />
                  <ni-button v-else data-cy="link" color="primary" icon="file_download"
                    @click="downloadTaxCertificate(props.row)" :disable="pdfLoading" />
                  <ni-button v-if="isCoach" color="copper-grey-400" icon="delete"
                    @click="validateTaxCertificateDeletion(col.value, props.row)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
      <div v-if="isCoach" class="q-mt-md" align="right">
        <ni-button class="add-payment" label="Ajouter une attestation" color="white" icon="add"
          @click="taxCertificateModal = true" />
      </div>
    </div>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal v-model:new-payment="newPayment" v-model="paymentCreationModal"
      :selected-customer="selectedCustomer" :loading="paymentCreationLoading" :validations="v$.newPayment"
      @submit="validatePaymentCreation(taxCertificates)" @hide="resetPaymentCreationModal"
      :selected-tpp="selectedTpp" />

    <!-- Payment edition modal -->
    <ni-payment-edition-modal :validations="v$.editedPayment" :selected-tpp="selectedTpp" v-model="paymentEditionModal"
      :loading="paymentEditionLoading" :selected-customer="selectedCustomer" v-model:edited-payment="editedPayment"
      @submit="validatePaymentUpdate(taxCertificates)" @hide="resetPaymentEditionModal" />

    <!-- Tax certificate upload modal -->
    <ni-modal v-model="taxCertificateModal" @hide="resetTaxCertificateModal">
      <template #title>
        Ajouter une <span class="text-weight-bold">attestation fiscale</span>
      </template>
      <ni-date-input caption="Date" v-model="taxCertificate.date" @blur="taxCertificatesValidation.date.$touch"
        :error-message="REQUIRED_LABEL" in-modal required-field />
      <ni-select caption="Année" v-model="taxCertificate.year" :options="yearOptions"
        @blur="taxCertificatesValidation.year.$touch" :error="taxCertificatesValidation.year.$error" in-modal
          required-field />
      <ni-input caption="Attestation" type="file" v-model="taxCertificate.file" :error-message="taxCertificateFileError"
        @blur="taxCertificatesValidation.file.$touch" in-modal :error="taxCertificatesValidation.file.$error" last
        required-field />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter l'attestation" icon-right="add" color="primary"
          :loading="modalLoading" @click="createTaxCertificate" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { useStore, mapGetters } from 'vuex';
import { ref, onMounted, computed } from 'vue';
import get from 'lodash/get';
import DateRange from '@components/form/DateRange';
import SimpleTable from '@components/table/SimpleTable';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import {
  DIRECT_DEBIT,
  COACH_ROLES,
  CLIENT_ADMIN,
  CUSTOMER,
  THIRD_PARTY_PAYER,
  HELPER,
  REQUIRED_LABEL,
} from '@data/constants';
import moment from '@helpers/moment';
import { formatIdentity } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import CustomerBillingTable from 'src/modules/client/components/customers/billing/CustomerBillingTable';
import PaymentCreationModal from 'src/modules/client/components/customers/billing/PaymentCreationModal';
import PaymentEditionModal from 'src/modules/client/components/customers/billing/PaymentEditionModal';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';
import { usePaymentMixin } from 'src/modules/client/mixins/paymentMixin';
import { useBalanceMixin } from './balanceMixin';
import { useTaxCertificatesMixin } from './taxCertificatesMixin';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
    'ni-date-range': DateRange,
    'ni-payment-creation-modal': PaymentCreationModal,
    'ni-payment-edition-modal': PaymentEditionModal,
    'ni-simple-table': SimpleTable,
    'ni-date-input': DateInput,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-button': Button,
  },
  mixins: [tableMixin],
  setup () {
    const store = useStore();
    const customer = computed(() => store.state.customer.customer);

    const {
      billingDates,
      customerDocuments,
      tppDocuments,
      setBillingDates,
      getStartBalance,
      getEndBalance,
      getCustomerBalanceWithDetails,
      formatDocumentList,
      computeCustomerBalance,
      computeTppBalances,
    } = useBalanceMixin(customer);

    const {
      taxCertificate,
      taxCertificates,
      taxCertificateModal,
      modalLoading,
      pdfLoading,
      disableAdministrativeDocument,
      customerFolder,
      getTaxCertificates,
      formatTaxCertificatePayload,
      resetTaxCertificateModal,
      createTaxCertificate,
      downloadTaxCertificateFromDrive,
      downloadTaxCertificate,
      validateTaxCertificateDeletion,
      deleteTaxCertificate,
      taxCertificatesValidation,
    } = useTaxCertificatesMixin(customer);

    const tableLoading = ref(false);
    const refresh = async () => {
      tableLoading.value = true;
      await getCustomerBalanceWithDetails();
      formatDocumentList();
      computeCustomerBalance();
      computeTppBalances();
      tableLoading.value = false;
    };

    const {
      paymentCreationLoading,
      paymentCreationModal,
      selectedCustomer,
      selectedTpp,
      newPayment,
      paymentEditionModal,
      paymentEditionLoading,
      editedPayment,
      v$,
      PAYMENT,
      PAYMENT_OPTIONS,
      openPaymentCreationModal,
      resetPaymentCreationModal,
      validatePaymentCreation,
      openEditionModal,
      resetPaymentEditionModal,
      validatePaymentUpdate,
      validateRefundDeletion,
    } = usePaymentMixin(refresh, taxCertificates);

    onMounted(async () => {
      setBillingDates();
      await refresh();
      await getTaxCertificates();
    });

    return {
      customer,
      tableLoading,
      paymentCreationLoading,
      paymentCreationModal,
      selectedCustomer,
      selectedTpp,
      newPayment,
      paymentEditionModal,
      paymentEditionLoading,
      editedPayment,
      v$,
      PAYMENT,
      DIRECT_DEBIT,
      PAYMENT_OPTIONS,
      openPaymentCreationModal,
      resetPaymentCreationModal,
      validatePaymentCreation,
      openEditionModal,
      resetPaymentEditionModal,
      validatePaymentUpdate,
      validateRefundDeletion,
      billingDates,
      customerDocuments,
      tppDocuments,
      getStartBalance,
      getEndBalance,
      taxCertificates,
      taxCertificateModal,
      modalLoading,
      pdfLoading,
      disableAdministrativeDocument,
      customerFolder,
      taxCertificate,
      taxCertificatesValidation,
      getTaxCertificates,
      formatTaxCertificatePayload,
      resetTaxCertificateModal,
      createTaxCertificate,
      downloadTaxCertificateFromDrive,
      downloadTaxCertificate,
      validateTaxCertificateDeletion,
      deleteTaxCertificate,
      refresh,
    };
  },
  data () {
    return {
      taxCertificatesColumns: [
        { name: 'year', field: 'year', align: 'left', label: 'Attestation' },
        { name: 'date', field: 'date', format: formatDate, align: 'left', label: 'Date' },
        { name: 'actions', field: '_id', align: 'center' },
      ],
      taxCertificatesPagination: { sortBy: 'year', descending: true, rowsPerPage: 0 },
      REQUIRED_LABEL,
      CUSTOMER,
      THIRD_PARTY_PAYER,
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany', clientRole: 'main/getClientRole' }),
    isHelper () {
      return HELPER === this.clientRole;
    },
    isAdmin () {
      return CLIENT_ADMIN === this.clientRole;
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    yearOptions () {
      const range = moment.range(moment('2000-01-01'), moment('2099-12-31'));
      const years = Array.from(range.by('years'));
      return years.map(year => ({ label: year.format('YYYY'), value: year.format('YYYY') }));
    },
    isArchived () {
      return !!this.customer.archivedAt;
    },
  },
  methods: {
    get,
    formatIdentity,
  },
};
</script>

<style lang="sass" scoped>
.add-payment
  background-color: $primary

.title
  display: flex
  flex-direction: row
  justify-content: space-between
  align-items: center
  flex-wrap: wrap

.message
  font-style: italic
  margin: 4px 0
</style>
