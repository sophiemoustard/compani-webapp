<template>
  <div>
    <div class="q-pa-sm q-mb-lg">
      <div class="title">
        <p class="text-weight-bold">{{ this.customer.identity | formatIdentity('FL') }}</p>
        <ni-date-range v-model="billingDates" @input="refresh" />
      </div>
      <div v-if="user.role.name === HELPER" class="message">
        Si vous souhaitez obtenir une facture non disponible sur cette page, adressez un email à support@alenvi.io.
      </div>
      <ni-customer-billing-table :documents="customerDocuments" :billingDates="billingDates"
        :displayActions="isAdmin" @openEditionModal="openEditionModal"
        :type="CUSTOMER" :startBalance="getStartBalance()" :endBalance="getEndBalance(customerDocuments)" />
      <div v-if="isCoach" align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" @click="openPaymentCreationModal(customer)"
          no-caps flat color="white" icon="add" />
      </div>
    </div>
    <div class="q-pa-sm q-mb-lg" v-for="tpp in tppDocuments" :key="tpp._id">
      <p class="text-weight-bold">{{ tpp.name }}</p>
      <ni-customer-billing-table :documents="tpp.documents" :billingDates="billingDates"
        :displayActions="isCoach" @openEditionModal="openEditionModal"
        :type="THIRD_PARTY_PAYER" :startBalance="getStartBalance(tpp)"
        :endBalance="getEndBalance(tpp.documents, tpp)" />
      <div v-if="isCoach" align="right">
        <q-btn class="add-payment" label="Ajouter un réglement" no-caps flat color="white" icon="add"
          @click="openPaymentCreationModal(customer, tpp.documents[0].client)"/>
      </div>
    </div>

    <!-- Payment creation modal -->
    <ni-payment-creation-modal :newPayment="newPayment" :selectedCustomer="selectedCustomer" :loading="modalLoading"
      :selectedClientName="selectedClientName" v-model="paymentCreationModal" :validations="$v.newPayment"
      @createPayment="createPayment" @resetForm="resetPaymentCreationModal" />

    <!-- Payment edition modal -->
    <ni-payment-edition-modal :editedPayment="editedPayment" :validations="$v.editedPayment" :loading="modalLoading"
      v-model="paymentEditionModal" :selectedCustomer="selectedCustomer" :selectedClientName="selectedClientName"
      @updatePayment="updatePayment"  @resetForm="resetPaymentEditionModal" />
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import {
  CREDIT_NOTE,
  BILL,
  DIRECT_DEBIT,
  BANK_TRANSFER,
  CHECK,
  CESU,
  REFUND,
  COACH_ROLES,
  ADMIN_ROLES,
  CUSTOMER,
  THIRD_PARTY_PAYER,
  HELPER,
} from '../../data/constants';
import CustomerBillingTable from '../../components/customers/CustomerBillingTable';
import PaymentCreationModal from '../../components/customers/PaymentCreationModal';
import PaymentEditionModal from '../../components/customers/PaymentEditionModal';
import DateRange from '../../components/form/DateRange';
import { paymentMixin } from '../../mixins/paymentMixin.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../../components/popup/notify';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'ProfileBilling',
  components: {
    'ni-customer-billing-table': CustomerBillingTable,
    'ni-date-range': DateRange,
    'ni-payment-creation-modal': PaymentCreationModal,
    'ni-payment-edition-modal': PaymentEditionModal,
  },
  mixins: [paymentMixin],
  data () {
    return {
      modalLoading: false,
      tableLoading: false,
      paymentEditionModal: false,
      customerDocuments: [],
      balancesForCustomer: [],
      tppDocuments: [],
      billingDates: { startDate: this.$moment().toISOString(), endDate: this.$moment().toISOString() },
      balances: [],
      COACH_ROLES,
      ADMIN_ROLES,
      CUSTOMER,
      THIRD_PARTY_PAYER,
      editedPayment: {},
      HELPER,
    }
  },
  computed: {
    customer () {
      return this.$store.getters['rh/getUserProfile'];
    },
    user () {
      return this.$store.getters['main/user'];
    },
    documentQuery () {
      return {
        customer: this.customer._id,
        startDate: this.billingDates.startDate,
        endDate: this.billingDates.endDate,
      };
    },
    isAdmin () {
      return ADMIN_ROLES.includes(this.user.role.name);
    },
    isCoach () {
      return COACH_ROLES.includes(this.user.role.name);
    },
  },
  async mounted () {
    this.setBillingDates();
    await this.refresh();
  },
  validations: {
    editedPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    },
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    },
  },
  methods: {
    // Billing dates
    setBillingDates () {
      this.billingDates.endDate = this.$moment().endOf('d').toISOString();
      this.billingDates.startDate = this.$moment().subtract(2, 'M').startOf('M').toISOString();
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
      this.computeIntermediateBalances(this.customerDocuments, customerStartBalance, CUSTOMER)
    },
    computeTppBalances () {
      for (const tpp of this.tppDocuments) {
        const tppStartBalance = this.getStartBalance(tpp)
        this.computeIntermediateBalances(tpp.documents, tppStartBalance, THIRD_PARTY_PAYER)
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
        case CESU:
          if (doc.nature === REFUND) return -doc.netInclTaxes;
          return doc.netInclTaxes;
      }
    },
    // Refresh data
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
        const balancesWithDetails = await this.$balances.listWithDetails(this.documentQuery);
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
        name: document.client.name,
        _id: document.client._id,
      };
    },
    formatDocumentList () {
      this.customerDocuments = [];
      const tppDocuments = {};

      for (const bill of this.bills) {
        bill.type = BILL;
        if (!bill.client) this.customerDocuments.push(bill);
        else if (bill.client._id && !tppDocuments[bill.client._id]) tppDocuments[bill.client._id] = this.newDocumentList(bill);
        else tppDocuments[bill.client._id].documents.push(bill);
      }

      for (const cd of this.creditNotes) {
        cd.type = CREDIT_NOTE;
        if (cd.inclTaxesCustomer) this.customerDocuments.push(cd);
        else if (cd.inclTaxesTpp && !tppDocuments[cd.thirdPartyPayer._id]) tppDocuments[cd.client._id] = this.newDocumentList(cd);
        else if (cd.inclTaxesTpp && tppDocuments[cd.thirdPartyPayer._id]) tppDocuments[cd.thirdPartyPayer._id].documents.push(cd);
      }

      for (const payment of this.payments) {
        if (!payment.client) this.customerDocuments.push(payment);
        else if (payment.client._id && !tppDocuments[payment.client._id]) tppDocuments[payment.client._id] = this.newDocumentList(payment);
        else tppDocuments[payment.client._id].documents.push(payment);
      }

      this.tppDocuments = Object.values(tppDocuments);
    },
    // Payments
    async createPayment () {
      try {
        this.modalLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = this.formatPayload(this.newPayment);
        await this.$payments.create(payload);
        this.paymentCreationModal = false;
        NotifyPositive('Règlement créé');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.modalLoading = false;
      }
    },
    openEditionModal (payment) {
      this.editedPayment = {
        _id: payment._id,
        nature: payment.nature,
        netInclTaxes: payment.netInclTaxes,
        type: payment.type,
        date: payment.date,
      };

      this.paymentEditionModal = true;
      this.selectedCustomer = payment.customer;
      this.selectedClientName = payment.client ? payment.client.name : formatIdentity(payment.customer.identity, 'FL');
    },
    resetPaymentEditionModal () {
      this.paymentEditionModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedClientName = '';
      this.editedPayment = {};
    },
    async updatePayment () {
      try {
        this.modalLoading = true;
        this.$v.editedPayment.$touch();
        if (this.$v.editedPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.$payments.update(this.editedPayment._id, this.$_.omit(this.editedPayment, '_id'));
        this.paymentEditionModal = false;
        NotifyPositive('Règlement créé');
        await this.refresh();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.modalLoading = false;
      }
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .add-payment
    background-color: $primary;

  .text-weight-bold
    color: $primary;

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
