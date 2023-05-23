import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const holdings = await alenviAxios.get(`${process.env.API_HOSTNAME}/holdings`);
    return holdings.data.data.holdings;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/holdings`, payload);
  },
};
