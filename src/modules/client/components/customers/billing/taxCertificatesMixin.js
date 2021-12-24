import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import snakeCase from 'lodash/snakeCase';
import TaxCertificates from '@api/TaxCertificates';
import GoogleDrive from '@api/GoogleDrive';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';
import { openPdf } from '@helpers/file';
import moment from '@helpers/moment';
import { formatIdentity } from '@helpers/utils';
import { validYear } from '@helpers/vuelidateCustomVal';

export const useTaxCertificatesMixin = (customer) => {
  const taxCertificates = ref([]);
  const taxCertificateModal = ref(false);
  const modalLoading = ref(false);
  const pdfLoading = ref(false);
  const disableAdministrativeDocument = ref(false);
  const customerFolder = computed(() => get(customer, 'driveFolder.driveId', null));
  const taxCertificate = ref({
    date: moment().toISOString(),
    year: moment().subtract(1, 'y').format('YYYY'),
    file: null,
  });

  const rules = {
    taxCertificate: {
      date: { required },
      year: { required, validYear },
      file: { required, maxSize: file => !!file && file.size < 5000000 },
    },
  };
  const taxCertificatesValidation = useVuelidate(rules, { taxCertificate });

  const taxCertificateFileError = computed(() => {
    if (taxCertificatesValidation.file.required.$response === false) return REQUIRED_LABEL;
    if (taxCertificatesValidation.file.maxSize.$response === false) return 'Fichier trop volumineux (> 5 Mo)';
    return '';
  });

  const taxCertificateYearError = computed(() => {
    if (taxCertificatesValidation.year.required.$response === false) return REQUIRED_LABEL;
    if (taxCertificatesValidation.year.validYear.$response === false) return 'Année invalide';
    return '';
  });

  const getTaxCertificates = async () => {
    try {
      taxCertificates.value = await TaxCertificates.list({ customer: customer._id });
    } catch (e) {
      console.error(e);
      taxCertificates.value = [];
    }
  };
  const formatTaxCertificatePayload = () => {
    const { file, date, year } = taxCertificate;
    const form = new FormData();
    const formattedDate = moment(date).format('DD-MM-YYYY-HHmm');
    const customerName = formatIdentity(customer.identity, 'FL');
    const fileName = snakeCase(`attestation_fiscale_${customerName}_${formattedDate}`);

    form.append('date', date);
    form.append('year', year);
    form.append('taxCertificate', file);
    form.append('mimeType', file.type || 'application/octet-stream');
    form.append('fileName', fileName);
    form.append('driveFolderId', customerFolder);
    form.append('customer', customer._id);

    return form;
  };

  const resetTaxCertificateModal = () => {
    taxCertificate.value = { date: moment().toISOString(), year: moment().subtract(1, 'y').format('YYYY'), file: null };
    taxCertificatesValidation.$reset();
  };

  const createTaxCertificate = async () => {
    if (!customerFolder.value) return NotifyNegative('Dossier du/de la bénéficiaire manquant.');
    taxCertificatesValidation.$touch();
    if (taxCertificatesValidation.$error) return NotifyWarning('Champ(s) invalide(s)');
    modalLoading.value = true;

    try {
      await TaxCertificates.create(formatTaxCertificatePayload());

      taxCertificateModal.value = false;
      NotifyPositive('Attestation fiscale sauvegardée.');
      await getTaxCertificates();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'envoi de l\'attestation fiscale.');
    } finally {
      modalLoading.value = false;
    }
  };
  const downloadTaxCertificateFromDrive = async (tc) => {
    try {
      disableAdministrativeDocument.value = true;
      await GoogleDrive.downloadFileById(get(tc, 'driveFile.driveId'));
    } catch (e) {
      console.error(e);
    } finally {
      disableAdministrativeDocument.value = false;
    }
  };

  const downloadTaxCertificate = async (tc) => {
    if (pdfLoading.value) return;

    try {
      pdfLoading.value = true;
      const pdf = await TaxCertificates.getPdf(tc._id);
      openPdf(pdf);
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors du téléchargement de l\'attestation fiscale');
    } finally {
      pdfLoading.value = false;
    }
  };

  const validateTaxCertificateDeletion = (taxCertificateId, row) => {
    this.$q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr(e) de vouloir supprimer cette attestation ?',
      ok: 'OK',
      cancel: 'Annuler',
    }).onOk(() => deleteTaxCertificate(taxCertificateId, row))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  const getRowIndex = (data, rowObj) => data.indexOf(rowObj);

  const deleteTaxCertificate = async (taxCertificateId, row) => {
    try {
      const index = getRowIndex(taxCertificates, row);
      await TaxCertificates.remove(taxCertificateId);
      taxCertificates.value.splice(index, 1);
      NotifyPositive('Attestation fiscale supprimée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la suppression de l\'attestation fiscale.');
    }
  };

  return {
    taxCertificates,
    taxCertificateModal,
    modalLoading,
    pdfLoading,
    disableAdministrativeDocument,
    customerFolder,
    taxCertificateFileError,
    taxCertificateYearError,
    getTaxCertificates,
    formatTaxCertificatePayload,
    resetTaxCertificateModal,
    createTaxCertificate,
    downloadTaxCertificateFromDrive,
    downloadTaxCertificate,
    validateTaxCertificateDeletion,
    deleteTaxCertificate,
    taxCertificatesValidation,
  };
};
