import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCustomerFollowUp (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-follow-up`, { params });

    return stats.data.data.followUp;
  },
  async getCustomerFundingsMonitoring (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-fundings-monitoring`, { params });

    return stats.data.data.customerFundingsMonitoring;
  },
  async getAllCustomersFundingsMonitoring (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/all-customers-fundings-monitoring`, { params });

    return stats.data.data.allCustomersFundingsMonitoring;
  },
  async getCustomersAndDurationByAuxiliary (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-duration/auxiliary`, { params });
    return stats.data.data.customersAndDuration;
  },
  async getCustomersAndDurationBySector (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-duration/sector`, { params });

    return stats.data.data.customersAndDuration;
  },
  async getInternalAndBilledHours (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/internal-billed-hours`, { params });

    return stats.data.data.internalAndBilledHours;
  },
}
