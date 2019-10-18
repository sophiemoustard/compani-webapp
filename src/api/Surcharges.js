import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    const surcharges = await alenviAxios.get(`${process.env.API_HOSTNAME}/surcharges`, { params });
    return surcharges.data.data.surcharges;
  },
  async create (payload) {
    const surcharges = await alenviAxios.post(`${process.env.API_HOSTNAME}/surcharges`, payload);
    return surcharges.data.data.surcharges;
  },
  async updateById (id, payload) {
    const surcharges = await alenviAxios.put(`${process.env.API_HOSTNAME}/surcharges/${id}`, payload);
    return surcharges.data.data.surcharge;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/surcharges/${id}`);
  },
}
