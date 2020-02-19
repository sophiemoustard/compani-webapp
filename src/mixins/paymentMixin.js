import pickBy from 'lodash/pickBy';
import { required } from 'vuelidate/lib/validators';
import Payments from '../api/Payments';
import { PAYMENT, DIRECT_DEBIT, PAYMENT_OPTIONS } from '../data/constants';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../components/popup/notify';

export const paymentMixin = {
  data () {
    return {
      paymentCreationLoading: false,
      paymentCreationModal: false,
      selectedCustomer: { identity: {} },
      selectedTpp: {},
      PAYMENT,
      DIRECT_DEBIT,
      PAYMENT_OPTIONS,
      newPayment: {},
    }
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
      this.newPayment = {
        customer: customer._id,
        nature: PAYMENT,
        date: this.$moment().toISOString(),
        netInclTaxes: 0,
        type: '',
      }
      if (tpp) {
        this.selectedTpp = { ...tpp };
        this.newPayment.thirdPartyPayer = tpp._id;
      }
      this.paymentCreationModal = true;
    },
    resetPaymentCreationModal () {
      this.paymentCreationModal = false;
      this.selectedCustomer = { identity: {} };
      this.selectedTpp = {};
      this.newPayment = {
        nature: PAYMENT,
        date: this.$moment().toISOString(),
        netInclTaxes: 0,
        type: '',
      };
      this.$v.newPayment.$reset();
    },
    async createPayment () {
      try {
        this.paymentCreationLoading = true;
        this.$v.newPayment.$touch();
        if (this.$v.newPayment.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Payments.create(pickBy(this.newPayment));
        NotifyPositive('Règlement créé');
        await this.refresh();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement');
      } finally {
        this.paymentCreationLoading = false;
      }
    },
  },
};
