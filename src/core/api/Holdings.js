import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const holdings = await alenviAxios.get(`${process.env.API_HOSTNAME}/holdings`);
    return holdings.data.data.holdings;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/holdings`, payload);
  },
  async getById (id) {
    const holding = await alenviAxios.get(`${process.env.API_HOSTNAME}/holdings/${id}`);
    return holding.data.data.holding;
  },
  async update (holdingId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/holdings/${holdingId}`, data);
  },
};
