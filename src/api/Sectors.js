import { alenviAxios } from './ressources/alenviAxios';

export default {
  async create (payload) {
    const sectors = await alenviAxios.post(`${process.env.API_HOSTNAME}/sectors`, payload);
    return sectors.data.data.sector;
  },
  async showAll (params) {
    const sectors = await alenviAxios.get(`${process.env.API_HOSTNAME}/sectors`, { params });
    return sectors.data.data.sectors;
  },
  async updateById (id, payload) {
    const sector = await alenviAxios.put(`${process.env.API_HOSTNAME}/sectors/${id}`, payload);
    return sector.data.data.sector;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/sectors/${id}`);
  },
}
