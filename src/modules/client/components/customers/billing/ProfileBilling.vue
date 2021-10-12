<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p data-cy="customer-identity" class="text-weight-bold text-primary">
          {{ this.customer.identity | formatIdentity('FL') }}
        </p>
        <ni-date-range v-model="billingDates" @input="refresh" />
      </div>
      <div v-if="isHelper && company.billingAssistance" class="message">
        Si vous souhaitez obtenir une facture non disponible sur cette page, adressez un email à
        <a :href="'mailto:' + company.billingAssistance"> {{ company.billingAssistance }}</a>.
      </div>
      <ni-customer-billing-table :documents="customerDocuments" :billing-dates="billingDates"
        @open-edition-modal="openEditionModal" :start-balance="getStartBalance()" :loading="tableLoading"
        :end-balance="getEndBalance(customerDocuments)" :type="CUSTOMER" @delete="validateRefundDeletion"
        :display-actions="isAdmin && !isArchived" />
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
        :pagination.sync="taxCertificatesPagination">
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
    <ni-payment-creation-modal :new-payment.sync="newPayment" v-model="paymentCreationModal" :selected-tpp="selectedTpp"
      :selected-customer="selectedCustomer" :loading="paymentCreationLoading" :validations="$v.newPayment"
      @submit="validatePaymentCreation(taxCertificates)" @hide="resetPaymentCreationModal" />

    <!-- Payment edition modal -->
    <ni-payment-edition-modal :validations="$v.editedPayment" :selected-tpp="selectedTpp" v-model="paymentEditionModal"
      :loading="paymentEditionLoading" :selected-customer="selectedCustomer" :edited-payment.sync="editedPayment"
      @submit="validatePaymentUpdate" @hide="resetPaymentEditionModal" />

    <!-- Tax certificate upload modal -->
    <ni-modal v-model="taxCertificateModal" @hide="resetTaxCertificateModal">
      <template slot="title">
        Ajouter une <span class="text-weight-bold">attestation fiscale</span>
      </template>
      <ni-date-input caption="Date" v-model="taxCertificate.date" @blur="$v.taxCertificate.date.$touch"
        :error-message="REQUIRED_LABEL" in-modal required-field />
      <ni-select caption="Année" v-model="taxCertificate.year" :options="yearOptions"
        @blur="$v.taxCertificate.year.$touch" :error="$v.taxCertificate.year.$error" in-modal required-field />
      <ni-input caption="Attestation" type="file" v-model="taxCertificate.file" :error="$v.taxCertificate.file.$error"
        @blur="$v.taxCertificate.file.$touch" in-modal required-field last :error-message="taxCertificateFileError" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter l'attestation" icon-right="add" color="primary"
          :loading="modalLoading" @click="createTaxCertificate" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import omit from 'lodash/omit';
import snakeCase from 'lodash/snakeCase';
import Payments from '@api/Payments';
import Balances from '@api/Balances';
import TaxCertificates from '@api/TaxCertificates';
import GoogleDrive from '@api/GoogleDrive';
import DateRange from '@components/form/DateRange';
import SimpleTable from '@components/table/SimpleTable';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import {
  CREDIT_NOTE,
  BILL,
  DIRECT_DEBIT,
  BANK_TRANSFER,
  CHECK,
  CESU,
  CASH,
  REFUND,
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
import { openPdf } from '@helpers/file';
import CustomerBillingTable from 'src/modules/client/components/customers/billing/CustomerBillingTable';
import PaymentCreationModal from 'src/modules/client/components/customers/billing/PaymentCreationModal';
import PaymentEditionModal from 'src/modules/client/components/customers/billing/PaymentEditionModal';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';
import { paymentMixin } from 'src/modules/client/mixins/paymentMixin';

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
  mixins: [paymentMixin, tableMixin],
  data () {
    return {
      pdfLoading: false,
      modalLoading: false,
      tableLoading: false,
      paymentEditionLoading: false,
      paymentEditionModal: false,
      customerDocuments: [],
      balancesForCustomer: [],
      tppDocuments: [],
      billingDates: { startDate: moment().toISOString(), endDate: moment().toISOString() },
      balances: [],
      editedPayment: {},
      taxCertificates: [],
      taxCertificatesColumns: [
        { name: 'year', field: 'year', align: 'left', label: 'Attestation' },
        { name: 'date', field: 'date', format: formatDate, align: 'left', label: 'Date' },
        { name: 'actions', field: '_id', align: 'center' },
      ],
      taxCertificatesPagination: {
        sortBy: 'year',
        descending: true,
        rowsPerPage: 0,
      },
      taxCertificate: {
        date: moment().toISOString(),
        year: moment().subtract(1, 'y').format('YYYY'),
        file: null,
      },
      taxCertificateModal: false,
      REQUIRED_LABEL,
      CUSTOMER,
      THIRD_PARTY_PAYER,
    };
  },
  computed: {
    ...mapState({
      loggedUser: state => state.main.loggedUser,
      customer: state => state.customer.customer,
    }),
    ...mapGetters({
      company: 'main/getCompany',
      clientRole: 'main/getClientRole',
    }),
    customerFolder () {
      return get(this.customer, 'driveFolder.driveId', null);
    },
    documentQuery () {
      return {
        customer: this.customer._id,
        startDate: this.billingDates.startDate,
        endDate: this.billingDates.endDate,
      };
    },
    isHelper () {
      return HELPER === this.clientRole;
    },
    isAdmin () {
      return CLIENT_ADMIN === this.clientRole;
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    taxCertificateFileError () {
      if (!this.$v.taxCertificate.file.required) return REQUIRED_LABEL;
      if (!this.$v.taxCertificate.file.maxSize) return 'Fichier trop volumineux (> 5 Mo)';
      return '';
    },
    taxCertificateYearError () {
      if (!this.$v.taxCertificate.year.required) return REQUIRED_LABEL;
      if (!this.$v.taxCertificate.year.validYear) return 'Année invalide';
      return '';
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
  async created () {
    this.setBillingDates();
    await this.refresh();
    await this.getTaxCertificates();
  },
  methods: {
    get,
    // Billing dates
    setBillingDates () {
      this.billingDates.endDate = moment().endOf('d').toISOString();
      this.billingDates.startDate = moment().subtract(2, 'M').startOf('M').toISOString();
    },
    // Compute balances
    getEndBalance (documents, tpp) {
      if (!documents || documents.length === 0) return this.getStartBalance(tpp);
      return documents[documents.length - 1].balance;
    },
    getStartBalance (tpp = null) {
      const balance = !tpp
        ? this.balances.find(bal => bal.customer._id === this.customer._id && !bal.thirdPartyPayer)
        : this.balances.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer._id === tpp._id);

      return balance ? balance.balance : 0;
    },
    computeCustomerBalance () {
      const customerStartBalance = this.getStartBalance();
      this.computeIntermediateBalances(this.customerDocuments, customerStartBalance, CUSTOMER);
    },
    computeTppBalances () {
      for (const tpp of this.tppDocuments) {
        const tppStartBalance = this.getStartBalance(tpp);
        this.computeIntermediateBalances(tpp.documents, tppStartBalance, THIRD_PARTY_PAYER);
      }
    },
    computeIntermediateBalances (docs, startBalance, type) {
      docs.sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 0, l = docs.length; i < l; i++) {
        if (i === 0) docs[i].balance = startBalance + this.getInclTaxes(docs[i], type);
        else docs[i].balance = docs[i - 1].balance + this.getInclTaxes(docs[i], type);
      }
    },
    getInclTaxes (doc, type) {
      switch (doc.type) {
        case BILL:
          return -doc.netInclTaxes;
        case CREDIT_NOTE:
          return type === CUSTOMER ? doc.inclTaxesCustomer : doc.inclTaxesTpp;
        case BANK_TRANSFER:
        case DIRECT_DEBIT:
        case CHECK:
        case CASH:
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    // Refresh data
    async getTaxCertificates () {
      try {
        this.taxCertificates = await TaxCertificates.list({ customer: this.customer._id });
      } catch (e) {
        console.error(e);
        this.taxCertificates = [];
      }
    },
    async refresh () {
      this.tableLoading = true;
      await this.getCustomerBalanceWithDetails();
      this.formatDocumentList();
      this.computeCustomerBalance();
      this.computeTppBalances();
      this.tableLoading = false;
    },
    async getCustomerBalanceWithDetails () {
      try {
        const balancesWithDetails = await Balances.listWithDetails(this.documentQuery);
        this.balances = balancesWithDetails.balances;
        this.payments = balancesWithDetails.payments;
        this.bills = balancesWithDetails.bills;
        this.creditNotes = balancesWithDetails.creditNotes;
      } catch (e) {
        this.balancesForCustomer = [];
        console.error(e);
      }
    },
    newDocumentList (document) {
      return {
        documents: [document],
        name: document.thirdPartyPayer.name,
        _id: document.thirdPartyPayer._id,
      };
    },
    formatDocumentList () {
      this.customerDocuments = [];
      const tppDocuments = {};

      for (const bill of this.bills) {
        bill.billType = bill.type;
        bill.type = BILL;
        if (!bill.thirdPartyPayer) this.customerDocuments.push(bill);
        else if (bill.thirdPartyPayer._id && !tppDocuments[bill.thirdPartyPayer._id]) {
          tppDocuments[bill.thirdPartyPayer._id] = this.newDocumentList(bill);
        } else tppDocuments[bill.thirdPartyPayer._id].documents.push(bill);
      }

      for (const cd of this.creditNotes) {
        cd.type = CREDIT_NOTE;
        if (cd.inclTaxesCustomer) this.customerDocuments.push(cd);
        else if (cd.inclTaxesTpp && !tppDocuments[cd.thirdPartyPayer._id]) {
          tppDocuments[cd.thirdPartyPayer._id] = this.newDocumentList(cd);
        } else if (cd.inclTaxesTpp && tppDocuments[cd.thirdPartyPayer._id]) {
          tppDocuments[cd.thirdPartyPayer._id].documents.push(cd);
        }
      }

      for (const payment of this.payments) {
        if (!payment.thirdPartyPayer) this.customerDocuments.push(payment);
        else if (payment.thirdPartyPayer._id && !tppDocuments[payment.thirdPartyPayer._id]) {
          tppDocuments[payment.thirdPartyPayer._id] = this.newDocumentList(payment);
        } else tppDocuments[payment.thirdPartyPayer._id].documents.push(payment);
      }

      this.tppDocuments = Object.values(tppDocuments);
    },
    // Payments
    openEditionModal (payment) {
      this.editedPayment = {
        _id: payment._id,
        nature: payment.nature,
        netInclTaxes: payment.netInclTaxes,
        type: payment.type,
        date: payment.date,
      };

      this.selectedCustomer = payment.customer;
      if (payment.thirdPartyPayer) {
        this.selectedTpp = payment.thirdPartyPayer;
        this.editedPayment.thirdPartyPayer = payment.thirdPartyPayer;
      }

      this.paymentEditionModal = true;
    },
    resetPaymentEditionModal () {
      this.paymentEditionModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedTpp = {};
      this.editedPayment = {};
    },
    async validatePaymentUpdate () {
      this.paymentEditionLoading = true;
      this.$v.editedPayment.$touch();
      if (this.$v.editedPayment.$error) {
        this.paymentEditionLoading = false;
        return NotifyWarning('Champ(s) invalide(s)');
      }

      if (!this.hasTaxCertificateOnSameYear(this.editedPayment, this.taxCertificates)) return this.updatePayment();

      this.$q.dialog({
        title: 'Confirmation',
        message: 'Attention, ce règlement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le modifier ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.updatePayment())
        .onCancel(() => {
          NotifyPositive('Modification annulée.');
          this.paymentEditionLoading = false;
        });
    },
    async updatePayment () {
      try {
        const payload = omit(this.editedPayment, ['_id', 'thirdPartyPayer']);
        await Payments.update(this.editedPayment._id, payload);
        this.paymentEditionModal = false;
        NotifyPositive('Règlement créé');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement.');
      } finally {
        this.paymentEditionLoading = false;
      }
    },
    // Tax certificates
    formatTaxCertificatePayload () {
      const { file, date, year } = this.taxCertificate;
      const form = new FormData();
      const formattedDate = moment(date).format('DD-MM-YYYY-HHmm');
      const customerName = formatIdentity(this.customer.identity, 'FL');
      const fileName = snakeCase(`attestation_fiscale_${customerName}_${formattedDate}`);

      form.append('date', date);
      form.append('year', year);
      form.append('taxCertificate', file);
      form.append('mimeType', file.type || 'application/octet-stream');
      form.append('fileName', fileName);
      form.append('driveFolderId', this.customerFolder);
      form.append('customer', this.customer._id);

      return form;
    },
    resetTaxCertificateModal () {
      this.taxCertificate = {
        date: moment().toISOString(),
        year: moment().subtract(1, 'y').format('YYYY'),
        file: null,
      };
      this.$v.taxCertificate.$reset();
    },
    async createTaxCertificate () {
      if (!this.customerFolder) return NotifyNegative('Dossier du/de la bénéficiaire manquant.');
      this.$v.taxCertificate.$touch();
      if (this.$v.taxCertificate.$error) return NotifyWarning('Champ(s) invalide(s)');
      this.modalLoading = true;

      try {
        await TaxCertificates.create(this.formatTaxCertificatePayload());

        this.taxCertificateModal = false;
        NotifyPositive('Attestation fiscale sauvegardée.');
        await this.getTaxCertificates();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi de l\'attestation fiscale.');
      } finally {
        this.modalLoading = false;
      }
    },
    async downloadTaxCertificateFromDrive (tc) {
      try {
        this.disableAdministrativeDocument = true;
        await GoogleDrive.downloadFileById(get(tc, 'driveFile.driveId'));
      } catch (e) {
        console.error(e);
      } finally {
        this.disableAdministrativeDocument = false;
      }
    },
    async downloadTaxCertificate (tc) {
      if (this.pdfLoading) return;

      try {
        this.pdfLoading = true;
        const pdf = await TaxCertificates.getPdf(tc._id);
        openPdf(pdf);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de l\'attestation fiscale');
      } finally {
        this.pdfLoading = false;
      }
    },
    validateTaxCertificateDeletion (taxCertificateId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette attestation ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteTaxCertificate(taxCertificateId, row))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteTaxCertificate (taxCertificateId, row) {
      try {
        const index = this.getRowIndex(this.taxCertificates, row);
        await TaxCertificates.remove(taxCertificateId);
        this.taxCertificates.splice(index, 1);
        NotifyPositive('Attestation fiscale supprimée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'attestation fiscale.');
      }
    },
    validateRefundDeletion (refund) {
      const message = this.hasTaxCertificateOnSameYear(refund, this.taxCertificates)
        ? 'Attention, ce remboursement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le supprimer ?'
        : 'Êtes-vous sûr(e) de vouloir supprimer ce remboursement ?';

      this.$q.dialog({
        title: 'Confirmation',
        message,
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteRefund(refund._id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteRefund (refundId) {
      try {
        await Payments.remove(refundId);
        this.refresh();
        NotifyPositive('Remboursement supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du remboursement.');
      }
    },
  },
  filters: {
    formatIdentity,
  },
};
</script>

<style lang="stylus" scoped>
  .add-payment
    background-color: $primary;

  .title
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

  .message
    font-style: italic;
    margin: 5px 0;
</style>
