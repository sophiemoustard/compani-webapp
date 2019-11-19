import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCustomerFollowUp (params = null) {
    try {
      const followUp = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-follow-up`, { params });
      return followUp.data.data.stats;
    } catch (e) {
      console.error(e.response);
    }
  },
  async getCustomerFundingsMonitoring (params = null) {
    try {
      const fundingsMonitoring = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-fundings-monitoring/${params.customer}`);
      return fundingsMonitoring.data.data.stats;
    } catch (e) {
      console.error(e.response);
    }
  },
}
