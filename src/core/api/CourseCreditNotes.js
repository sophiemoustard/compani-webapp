import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/coursecreditnotes`, payload);
  },
  async getPdf (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/coursecreditnotes/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
