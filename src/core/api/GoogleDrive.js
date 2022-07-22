import { alenviAxios } from '@api/ressources/alenviAxios';
import { downloadFile, getExtension } from '@helpers/file';

export default {
  async getFileById (params) {
    const file = await alenviAxios.get(`${process.env.API_HOSTNAME}/gdrive/file/${params.id}`);
    return file;
  },
  async getList (params) {
    const list = await alenviAxios.get(`${process.env.API_HOSTNAME}/gdrive/list`, { params });
    return list.data.data.files;
  },
  async removeFileById (params) {
    const file = await alenviAxios.delete(`${process.env.API_HOSTNAME}/gdrive/file/${params.id}`);
    return file;
  },
  async generateDocx (params, data) {
    const file = await alenviAxios({
      url: `${process.env.API_HOSTNAME}/gdrive/${params.driveId}/generatedocx`,
      method: 'POST',
      responseType: 'blob',
      data,
    });
    return file;
  },
  getUploadUrl (driveId) {
    return `${process.env.API_HOSTNAME}/gdrive/${driveId}/upload`;
  },
  async downloadFileById (driveId, name, getHtmlFile = false) {
    const file = await alenviAxios({
      url: `${process.env.API_HOSTNAME}/gdrive/file/${driveId}/download`,
      method: 'GET',
      ...(!getHtmlFile && { responseType: 'blob' }),
    });

    if (getHtmlFile) return file;
    const extension = getExtension(file.data.type);

    const fileName = name ? `${name}.${extension}` : `download-${Date.now()}.${extension}`;
    return downloadFile(file, fileName, 'application/octet-stream');
  },
};
