import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import snakeCase from 'lodash/snakeCase';
import TaxCertificates from '@api/TaxCertificates';
import GoogleDrive from '@api/GoogleDrive';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';
import { formatIdentity, formatDownloadName } from '@helpers/utils';
import { validYear } from '@helpers/vuelidateCustomVal';

export const useTaxCertificates = (customer) => {
  const $q = useQuasar();
  const taxCertificates = ref([]);
  const taxCertificateModal = ref(false);
  const modalLoading = ref(false);
  const pdfLoading = ref(false);
  const disableTaxCertificate = ref(false);
  const customerFolder = computed(() => get(customer.value, 'driveFolder.driveId', null));
  const taxCertificate = ref({
    date: moment().toISOString(),
    year: moment().subtract(1, 'y').format('YYYY'),
    file: null,
  });

  const rules = {
    date: { required },
    year: { required, validYear },
    file: { required, maxSize: file => !!file && file.size < 5000000 },
  };
  const taxCertificatesValidation = useVuelidate(rules, taxCertificate);

  const taxCertificateFileError = computed(() => {
    if (taxCertificatesValidation.value.file.required.$response === false) return REQUIRED_LABEL;
    if (taxCertificatesValidation.value.file.maxSize.$response === false) return 'Fichier trop volumineux (> 5 Mo)';
    return '';
  });

  const taxCertificateYearError = computed(() => {
    if (taxCertificatesValidation.value.year.required.$response === false) return REQUIRED_LABEL;
    if (taxCertificatesValidation.value.year.validYear.$response === false) return 'Année invalide';
    return '';
  });

  const getTaxCertificates = async () => {
    try {
      taxCertificates.value = await TaxCertificates.list({ customer: customer.value._id });
    } catch (e) {
      console.error(e);
      taxCertificates.value = [];
    }
  };
  const formatTaxCertificatePayload = () => {
    const { file, date, year } = taxCertificate.value;
    const form = new FormData();
    const formattedDate = moment(date).format('DD-MM-YYYY-HHmm');
    const customerName = formatIdentity(customer.identity, 'FL');
    const fileName = snakeCase(`attestation_fiscale_${customerName}_${formattedDate}`);

    form.append('date', date);
    form.append('year', year);
    form.append('taxCertificate', file);
    form.append('mimeType', file.type || 'application/octet-stream');
    form.append('fileName', fileName);
    form.append('driveFolderId', customerFolder.value);
    form.append('customer', customer.value._id);

    return form;
  };

  const resetTaxCertificateModal = () => {
    taxCertificate.value = { date: moment().toISOString(), year: moment().subtract(1, 'y').format('YYYY'), file: null };
    taxCertificatesValidation.value.$reset();
  };

  const createTaxCertificate = async () => {
    if (!customerFolder.value) return NotifyNegative('Dossier du/de la bénéficiaire manquant.');
    taxCertificatesValidation.value.$touch();
    if (taxCertificatesValidation.value.$error) return NotifyWarning('Champ(s) invalide(s)');
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

  const taxCertificateDocName = (tc, customerIdentity) => {
    const fileName = `${tc.year} ${customerIdentity.lastname} ${customerIdentity.firstname} attestation_fiscale`;
    return formatDownloadName(fileName);
  };

  const downloadTaxCertificateFromDrive = async (tc) => {
    try {
      disableTaxCertificate.value = true;

      await GoogleDrive.downloadFileById(
        get(tc, 'driveFile.driveId'),
        taxCertificateDocName(tc, customer.value.identity)
      );
    } catch (e) {
      console.error(e);
    } finally {
      disableTaxCertificate.value = false;
    }
  };

  const downloadTaxCertificate = async (tc) => {
    if (pdfLoading.value) return;

    try {
      pdfLoading.value = true;

      const pdf = await TaxCertificates.getPdf(tc._id);

      downloadFile(pdf, `${taxCertificateDocName(tc, customer.value.identity)}.pdf`, 'application/octet-stream');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors du téléchargement de l\'attestation fiscale');
    } finally {
      pdfLoading.value = false;
    }
  };

  const validateTaxCertificateDeletion = (taxCertificateId, row) => {
    $q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr(e) de vouloir supprimer cette attestation&nbsp;?',
      html: true,
      ok: 'OK',
      cancel: 'Annuler',
    }).onOk(() => deleteTaxCertificate(taxCertificateId, row))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  const getRowIndex = (data, rowObj) => data.indexOf(rowObj);

  const deleteTaxCertificate = async (taxCertificateId, row) => {
    try {
      const index = getRowIndex(taxCertificates.value, row);
      await TaxCertificates.remove(taxCertificateId);
      taxCertificates.value.splice(index, 1);
      NotifyPositive('Attestation fiscale supprimée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la suppression de l\'attestation fiscale.');
    }
  };

  return {
    // Data
    taxCertificate,
    taxCertificates,
    taxCertificateModal,
    modalLoading,
    pdfLoading,
    disableTaxCertificate,
    // Computed
    customerFolder,
    taxCertificateFileError,
    taxCertificateYearError,
    // Validations
    taxCertificatesValidation,
    /// Methods
    getTaxCertificates,
    formatTaxCertificatePayload,
    resetTaxCertificateModal,
    createTaxCertificate,
    downloadTaxCertificateFromDrive,
    downloadTaxCertificate,
    validateTaxCertificateDeletion,
    deleteTaxCertificate,
  };
};
