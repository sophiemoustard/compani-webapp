import { required } from 'vuelidate/lib/validators';
import { PAYMENT, DIRECT_DEBIT, PAYMENT_OPTIONS } from '../data/constants';
import { formatIdentity } from '../helpers/utils.js';

export const paymentMixin = {
  data () {
    return {
      creationLoading: false,
      paymentCreationModal: false,
      selectedCustomer: { identity: {} },
      selectedClientName: '',
      PAYMENT,
      DIRECT_DEBIT,
      PAYMENT_OPTIONS,
      defaultPayment: {
        nature: PAYMENT,
        customer: null,
        client: null,
        netInclTaxes: 0,
        type: '',
        date: new Date(),
      },
      newPayment: null,
    }
  },
  created () {
    this.newPayment = { ...this.defaultPayment };
  },
  validations: {
    newPayment: {
      netInclTaxes: { required },
      type: { required },
      date: { required },
    },
  },
  methods: {
    openPaymentCreationModal (customer, tpp) {
      this.selectedCustomer = { ...customer };
      this.selectedClientName = tpp ? tpp.name : formatIdentity(customer.identity, 'FL');
      this.newPayment.customer = customer._id;
      this.newPayment.nature = PAYMENT;
      this.newPayment.client = tpp ? tpp._id : customer._id;
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.paymentCreationModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedClientName = '';
      this.newPayment = { ...this.defaultPayment };
      this.$v.newPayment.$reset();
    },
    formatPayload (payment) {
      const payload = { ...payment };

      if (payload.customer === payload.client) {
        delete payload.client
      }

      return payload;
    },
  },
};
