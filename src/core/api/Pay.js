import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getHoursBalanceDetail (params = null) {
    const hoursBalanceDetail = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/pay/hours-balance-details`,
      { params }
    );
    return hoursBalanceDetail.data.data.hoursBalanceDetail;
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
