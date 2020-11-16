import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getDraftPay (params = null) {
    const draftPay = await alenviAxios.get(`${process.env.API_HOSTNAME}/pay/draft`, { params });
    return draftPay.data.data.draftPay;
  },
  async getHoursBalanceDetail (params = null) {
    const hoursBalanceDetail = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/pay/hours-balance-details`,
      { params }
    );
    return hoursBalanceDetail.data.data.hoursBalanceDetail;
  },
  async createList (payload) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/pay`, payload);
  },
  async getHoursToWork (params = null) {
    const hoursToWork = await alenviAxios.get(`${process.env.API_HOSTNAME}/pay/hours-to-work`, { params });
    return hoursToWork.data.data.hoursToWork;
  },
  async export (type, params) {
    return alenviAxios({
      url: `${process.env.API_HOSTNAME}/pay/export/${type}`,
      method: 'GET',
      responseType: 'blob',
      params,
    });
  },
};
