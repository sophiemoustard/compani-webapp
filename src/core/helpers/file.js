import gdrive from '@api/GoogleDrive';

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

export const downloadCsv = (data, fileName) => {
  let csvContent = '\ufeff'; // UTF16LE BOM for Microsoft Excel
  data.forEach((rowArray) => {
    const row = rowArray.join(';');
    csvContent += `${row}\r\n`;
  });

  return downloadFile({ data: csvContent }, fileName);
};

export const openPdf = (pdf, platform) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([pdf.data], { type: 'application/pdf' }));
  document.body.appendChild(link);
  link.setAttribute('target', platform.is.safari ? '_self' : '_blank');
  link.click();
  document.body.removeChild(link);
};

export const downloadZip = (zip, fileName, platform) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([zip.data], { type: 'application/zip' }));
  document.body.appendChild(link);
  link.setAttribute('download', fileName);
  link.setAttribute('target', platform.is.safari ? '_self' : '_blank');
  link.click();
  document.body.removeChild(link);
};
