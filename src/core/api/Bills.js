import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getPdf (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/bills/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
