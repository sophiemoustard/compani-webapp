import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    const services = await alenviAxios.get(`${process.env.API_HOSTNAME}/services`, { params });
    return services.data.data.services;
  },
  async create (payload) {
    const services = await alenviAxios.post(`${process.env.API_HOSTNAME}/services`, payload);
    return services.data.data.service;
  },
  async updateById (id, payload) {
    const services = await alenviAxios.put(`${process.env.API_HOSTNAME}/services/${id}`, payload);
    return services.data.data.service;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/services/${id}`);
  },
}
