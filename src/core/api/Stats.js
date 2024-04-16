import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getPaidInterventionStats (params = null) {
    const stats = await alenviAxios.get(`${process.env.API_HOSTNAME}/stats/paid-intervention-stats`, { params });
    return stats.data.data.paidInterventionStats;
  },
};
