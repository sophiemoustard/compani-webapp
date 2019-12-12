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
      const fundingsMonitoring = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-fundings-monitoring`, { params });
      return fundingsMonitoring.data.data.customerFundingsMonitoring;
    } catch (e) {
      console.error(e.response);
    }
  },
  async getCustomersAndDuration (params = null) {
    try {
      const customerAndDuration = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-duration`, { params });
      return customerAndDuration.data.data.customerAndDuration;
    } catch (e) {
      console.error(e.response);
    }
  },
}
