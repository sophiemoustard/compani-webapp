import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params = null) {
    const balances = await alenviAxios.get(`${process.env.API_HOSTNAME}/balances`, { params });
    return balances.data.data.balances;
  },
  async listWithDetails (params = null) {
    const balances = await alenviAxios.get(`${process.env.API_HOSTNAME}/balances/details`, { params });
    return balances.data.data;
  },
};
