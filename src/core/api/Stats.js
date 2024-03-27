import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getCustomerFollowUp (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-follow-up`, { params });

    return stats.data.data.followUp;
  },
  async getCustomerFundingsMonitoring (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/customer-fundings-monitoring`, { params });

    return stats.data.data.customerFundingsMonitoring;
  },
  async getPaidInterventionStats (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/paid-intervention-stats`, { params });
    return stats.data.data.paidInterventionStats;
  },
};
