import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params = null) {
    const billSlips = await alenviAxios.get(`${process.env.API_HOSTNAME}/billslips`, { params });
    return billSlips.data.data.billSlips;
  },
  getDocx (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/billslips/${id}/docx`,
      {
        responseType: 'arraybuffer',
        header: { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      }
    );
  },
};
