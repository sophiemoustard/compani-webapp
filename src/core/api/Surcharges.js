import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const surcharges = await alenviAxios.get(`${process.env.API_HOSTNAME}/surcharges`, { params });
    return surcharges.data.data.surcharges;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/surcharges`, payload);
  },
  async updateById (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/surcharges/${id}`, payload);
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/surcharges/${id}`);
  },
};
