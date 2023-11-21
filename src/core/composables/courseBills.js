import { ref } from 'vue';
import get from 'lodash/get';
import CourseBills from '@api/CourseBills';
import CourseCreditNotes from '@api/CourseCreditNotes';
import { NotifyNegative } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';
import { formatDownloadName } from '@helpers/utils';
import { downloadFile } from '@helpers/file';

export const useCourseBilling = (courseBills, validations) => {
  const pdfLoading = ref(false);

  const downloadBill = async (bill) => {
    try {
      pdfLoading.value = true;
      const pdf = await CourseBills.getPdf(bill._id);
      const pdfName = `${formatDownloadName(`${bill.payer.name} ${bill.number}`)}.pdf`;
      downloadFile(pdf, pdfName, 'application/octet-stream');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors du téléchargement de la facture.');
    } finally {
      pdfLoading.value = false;
    }
  };

  const downloadCreditNote = async (creditNote) => {
    try {
      pdfLoading.value = true;
      const pdf = await CourseCreditNotes.getPdf(creditNote._id);
      const { payer } = courseBills.value.find(bill => bill._id === creditNote.courseBill);
      const pdfName = `${formatDownloadName(`${payer.name} ${creditNote.number}`)}.pdf`;
      downloadFile(pdf, pdfName, 'application/octet-stream');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors du téléchargement de l\'avoir.');
    } finally {
      pdfLoading.value = false;
    }
  };

  const getBillErrorMessages = (parent) => {
    let price = '';
    let count = '';
    if (get(validations, `value.${parent}.price.required.$response`) === false) price = REQUIRED_LABEL;
    if (get(validations, `value.${parent}.price.strictPositiveNumber.$response`) === false) {
      price = 'Prix non valide';
    }

    if (get(validations, `value.${parent}.count.required.$response`) === false) count = REQUIRED_LABEL;
    if (get(validations, `value.${parent}.count.strictPositiveNumber.$response`) === false ||
      get(validations, `value.${parent}.count.integerNumber.$response`) === false) {
      count = 'Nombre non valide';
    }

    return { price, count };
  };

  return {
    // Data
    pdfLoading,
    // Methods
    downloadBill,
    downloadCreditNote,
    getBillErrorMessages,
  };
};
