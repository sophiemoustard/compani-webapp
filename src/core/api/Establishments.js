import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    const establishment = await alenviAxios.post(`${process.env.API_HOSTNAME}/establishments`, payload);
    return establishment.data.data.establishment;
  },
  async list (params) {
    const establishments = await alenviAxios.get(`${process.env.API_HOSTNAME}/establishments`, { params });
    return establishments.data.data.establishments;
  },
  async update (id, payload) {
    const establishment = await alenviAxios.put(`${process.env.API_HOSTNAME}/establishments/${id}`, payload);
    return establishment.data.data.establishment;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/establishments/${id}`);
  },
};
