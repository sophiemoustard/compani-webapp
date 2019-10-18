import gdrive from '../api/GoogleDrive';

export const downloadFile = (file, fileName) => {
  const url = window.URL.createObjectURL(new Blob([file.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
};

export const downloadDocxFile = async (params, data, fileName) => {
  const file = await gdrive.generateDocx(params, data);
  downloadFile(file, fileName);
};

export const generatePdfUrl = (pdf) => {
  const blob = new Blob([pdf.data], { type: 'application/pdf' })
  return window.URL.createObjectURL(blob);
};

export const downloadCsv = (data, fileName) => {
  let csvContent = '\ufeff'; // UTF16LE BOM for Microsoft Excel
  data.forEach((rowArray) => {
    const row = rowArray.join(';');
    csvContent += `${row}\r\n`;
  });

  return downloadFile({ data: csvContent }, fileName);
};
