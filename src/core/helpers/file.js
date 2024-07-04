import { Platform } from 'quasar';

export const downloadFile = (file, fileName, type = '') => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([file.data], { type }));
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadZip = (zip, fileName) => {
  downloadFile(zip, fileName, 'application/zip');
};

export const downloadDocx = (docx, fileName) => {
  downloadFile(docx, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
};

export const downloadCsv = (data, fileName) => {
  let csvContent = '\ufeff'; // UTF16LE BOM for Microsoft Excel
  data.forEach((rowArray) => {
    const row = rowArray.join(';');
    csvContent += `${row}\r\n`;
  });

  return downloadFile({ data: csvContent }, fileName);
};

export const openPdf = (pdf) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdf.data], { type: 'application/pdf' }));
  document.body.appendChild(link);
  link.setAttribute('target', Platform.is.safari ? '_self' : '_blank');
  link.click();
  document.body.removeChild(link);
};

export const getExtension = (type) => {
  const mimeType = type.substring(type.indexOf('/') + 1);
  switch (mimeType) {
    case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'msword':
      return 'doc';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'xlsx';
    case 'plain':
      return 'txt';
    default:
      return mimeType;
  }
};
