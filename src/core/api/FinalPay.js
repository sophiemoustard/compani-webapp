import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDraftFinalPay (params = null) {
    const draftFinalPay = await alenviAxios.get(`${process.env.API_HOSTNAME}/finalpay/draft`, { params });
    return draftFinalPay.data.data.draftFinalPay;
  },
  async createList (payload) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/finalpay`, payload);
  },
}
