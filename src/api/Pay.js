import { alenviAxios } from './ressources/alenviAxios';

export default {
  async getDraftPay (params = null) {
    const draftPay = await alenviAxios.get(`${process.env.API_HOSTNAME}/pay/draft`, { params });
    return draftPay.data.data.draftPay;
  },
  async getHoursBalanceDetail (params = null) {
    const hoursBalanceDetail = await alenviAxios.get(`${process.env.API_HOSTNAME}/pay/hours-balance-details`, { params });
    return hoursBalanceDetail.data.data.hoursBalanceDetail;
  },
  async createList (payload) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/pay`, payload);
  },
}
