import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const services = await alenviAxios.get(`${process.env.API_HOSTNAME}/services`, { params });
    return services.data.data.services;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/services`, payload);
  },
  async updateById (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/services/${id}`, payload);
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/services/${id}`);
  },
};
