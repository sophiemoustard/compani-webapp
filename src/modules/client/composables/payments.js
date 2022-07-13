import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import Payments from '@api/Payments';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { PAYMENT, DIRECT_DEBIT, PAYMENT_OPTIONS } from '@data/constants';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';

export const usePayments = (refresh) => {
  const $q = useQuasar();
  const paymentCreationLoading = ref(false);
  const paymentCreationModal = ref(false);
  const newPayment = ref({});
  const paymentEditionModal = ref(false);
  const paymentEditionLoading = ref(false);
  const editedPayment = ref({});
  const selectedCustomer = ref({ identity: {} });
  const selectedTpp = ref({});

  const rules = computed(() => ({
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
  }));

  const v$ = useVuelidate(rules, { newPayment, editedPayment });

  const openPaymentCreationModal = (customer, tpp) => {
    selectedCustomer.value = { ...customer };
    newPayment.value = {
      customer: customer._id,
      nature: PAYMENT,
      date: moment().toISOString(),
      netInclTaxes: 0,
      type: '',
    };
    if (tpp) {
      selectedTpp.value = { ...tpp };
      newPayment.value.thirdPartyPayer = tpp._id;
    }
    paymentCreationModal.value = true;
  };

  const resetPaymentCreationModal = () => {
    paymentCreationModal.value = false;
    selectedCustomer.value = { identity: {} };
    selectedTpp.value = {};
    newPayment.value = {
      nature: PAYMENT,
      date: moment().toISOString(),
      netInclTaxes: 0,
      type: '',
    };
    v$.value.newPayment.$reset();
  };

  const hasTaxCertificateOnSameYear = (payment, taxCertificates) => {
    const paymentDate = (new Date(payment.date)).getFullYear().toString();
    return taxCertificates.some(tax => tax.year === paymentDate);
  };

  const createPayment = async () => {
    try {
      await Payments.create(pickBy(newPayment.value));
      NotifyPositive('Règlement créé');
      await refresh();
      paymentCreationModal.value = false;
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la création du règlement.');
    } finally {
      paymentCreationLoading.value = false;
    }
  };

  const validatePaymentCreation = (taxCertificates) => {
    paymentCreationLoading.value = true;
    v$.value.newPayment.$touch();
    if (v$.value.newPayment.$error) {
      paymentCreationLoading.value = false;
      return NotifyWarning('Champ(s) invalide(s)');
    }

    if (!hasTaxCertificateOnSameYear(newPayment.value, taxCertificates)) return createPayment();

    $q.dialog({
      title: 'Confirmation',
      message: 'Attention, ce règlement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le créer ?',
      ok: 'OK',
      cancel: 'Annuler',
    })
      .onOk(() => createPayment())
      .onCancel(() => {
        NotifyPositive('Création annulée.');
        paymentCreationLoading.value = false;
      });
  };

  const openEditionModal = (payment) => {
    editedPayment.value = {
      _id: payment._id,
      nature: payment.nature,
      netInclTaxes: payment.netInclTaxes,
      type: payment.type,
      date: payment.date,
    };

    selectedCustomer.value = payment.customer;
    if (payment.thirdPartyPayer) {
      selectedTpp.value = payment.thirdPartyPayer;
      editedPayment.value.thirdPartyPayer = payment.thirdPartyPayer;
    }

    paymentEditionModal.value = true;
  };

  const resetPaymentEditionModal = () => {
    paymentEditionModal.value = false;
    selectedCustomer.value = { identity: {} };
    selectedTpp.value = {};
    editedPayment.value = {};
  };

  const validatePaymentUpdate = async (taxCertificates) => {
    paymentEditionLoading.value = true;
    v$.value.editedPayment.$touch();
    if (v$.value.editedPayment.$error) {
      paymentEditionLoading.value = false;
      return NotifyWarning('Champ(s) invalide(s)');
    }

    if (!hasTaxCertificateOnSameYear(editedPayment.value, taxCertificates)) return updatePayment();

    $q.dialog({
      title: 'Confirmation',
      message: 'Attention, ce règlement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le modifier ?',
      ok: 'OK',
      cancel: 'Annuler',
    })
      .onOk(() => updatePayment())
      .onCancel(() => {
        NotifyPositive('Modification annulée.');
        paymentEditionLoading.value = false;
      });
  };

  const updatePayment = async () => {
    try {
      const payload = omit(editedPayment.value, ['_id', 'thirdPartyPayer']);
      await Payments.update(editedPayment.value._id, payload);
      paymentEditionModal.value = false;
      NotifyPositive('Règlement modifié.');
      await refresh();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'édition du règlement.');
    } finally {
      paymentEditionLoading.value = false;
    }
  };

  const validateRefundDeletion = (refund, taxCertificates) => {
    const message = hasTaxCertificateOnSameYear(refund, taxCertificates)
      ? 'Attention, ce remboursement est lié à une attestation fiscale, êtes-vous sûr(e) de vouloir le supprimer ?'
      : 'Êtes-vous sûr(e) de vouloir supprimer ce remboursement ?';

    $q.dialog({ title: 'Confirmation', message, ok: 'OK', cancel: 'Annuler' })
      .onOk(() => deleteRefund(refund._id))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  const deleteRefund = async (refundId) => {
    try {
      await Payments.remove(refundId);
      await refresh();
      NotifyPositive('Remboursement supprimé.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la suppression du remboursement.');
    }
  };

  return {
    // Data
    paymentCreationLoading,
    paymentCreationModal,
    selectedCustomer,
    selectedTpp,
    newPayment,
    paymentEditionModal,
    paymentEditionLoading,
    editedPayment,
    PAYMENT,
    DIRECT_DEBIT,
    PAYMENT_OPTIONS,
    // Validations
    v$,
    // Methods
    openPaymentCreationModal,
    resetPaymentCreationModal,
    hasTaxCertificateOnSameYear,
    validatePaymentCreation,
    openEditionModal,
    resetPaymentEditionModal,
    validatePaymentUpdate,
    validateRefundDeletion,
  };
};
