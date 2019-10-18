import { alenviAxios } from './ressources/alenviAxios';

export default {
  async showAll (params = null) {
    const balances = await alenviAxios.get(`${process.env.API_HOSTNAME}/balances`, { params });
    return balances.data.data.balances;
  },
}
