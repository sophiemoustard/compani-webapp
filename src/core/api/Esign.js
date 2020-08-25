import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getDocument (docId) {
    const doc = await alenviAxios.get(`${process.env.API_HOSTNAME}/esign/${docId}`);
    return doc.data.data.document;
  },
};
