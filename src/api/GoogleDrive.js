import { alenviAxios } from './ressources/alenviAxios';

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
}
