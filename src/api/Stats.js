import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCustomerFollowUp (params = null) {
    const followUp = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-follow-up`, { params });
    return followUp.data.data.stats;
  },
  async getCustomerFundingsMonitoring (params = null) {
    const fundingsMonitoring = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-fundings-monitoring`, { params });
    return fundingsMonitoring.data.data.customerFundingsMonitoring;
  },
  async getAllCustomersFundingsMonitoring (params = null) {
    const fundingsMonitoring = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/all-customers-fundings-monitoring`, { params });
    return fundingsMonitoring.data.data.allCustomersFundingsMonitoring;
  },
  async getCustomersAndDurationByAuxiliary (params = null) {
    const customerAndDuration = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-duration-auxiliary`, { params });
    return customerAndDuration.data.data.customerAndDuration;
  },
  async getCustomersAndDurationBySector (params = null) {
    const customerAndDuration = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-duration-sector`, { params });
    return customerAndDuration.data.data.customerAndDuration;
  },
}
