import pickBy from 'lodash/pickBy';
import { required } from '@vuelidate/validators';
import Payments from '@api/Payments';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { PAYMENT, DIRECT_DEBIT, PAYMENT_OPTIONS } from '@data/constants';
import { strictPositiveNumber, validYear } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';

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
    };
  },
  validations () {
    return {
      newPayment: {
        customer: { required },
        nature: { required },
        netInclTaxes: { required, strictPositiveNumber },
        type: { required },
        date: { required },
      },
      editedPayment: {
        nature: { required },
        netInclTaxes: { required, strictPositiveNumber },
        type: { required },
        date: { required },
      },
      taxCertificate: {
        date: { required },
        year: { required, validYear },
        file: { required, maxSize: file => !!file && file.size < 5000000 },
      },
    };
  },
  methods: {
    openPaymentCreationModal (customer, tpp) {
      this.selectedCustomer = { ...customer };
      this.newPayment = {
        customer: customer._id,
        nature: PAYMENT,
        date: moment().toISOString(),
        netInclTaxes: 0,
        type: '',
      };
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
        date: moment().toISOString(),
        netInclTaxes: 0,
        type: '',
      };
      this.$v.newPayment.$reset();
    },
    hasTaxCertificateOnSameYear (payment, taxCertificates) {
      const paymentDate = (new Date(payment.date)).getFullYear().toString();
      return taxCertificates.some(tax => tax.year === paymentDate);
    },
    validatePaymentCreation (taxCertificates) {
      this.paymentCreationLoading = true;
      this.$v.newPayment.$touch();
      if (this.$v.newPayment.$error) {
        this.paymentCreationLoading = false;
        return NotifyWarning('Champ(s) invalide(s)');
      }

      if (!this.hasTaxCertificateOnSameYear(this.newPayment, taxCertificates)) return this.createPayment();

      this.$q.dialog({
        title: 'Confirmation',
        message: 'Attention, ce règlement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le créer ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.createPayment())
        .onCancel(() => {
          NotifyPositive('Création annulée.');
          this.paymentCreationLoading = false;
        });
    },
    async createPayment () {
      try {
        await Payments.create(pickBy(this.newPayment));
        NotifyPositive('Règlement créé');
        await this.refresh();
        this.paymentCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du règlement.');
      } finally {
        this.paymentCreationLoading = false;
      }
    },
  },
};
