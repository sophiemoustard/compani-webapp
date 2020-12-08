import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const categories = await alenviAxios.get(`${process.env.API_HOSTNAME}/categories`, { params });
    return categories.data.data.categories;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/categories`, payload);
  },
  async update (categoryId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/categories/${categoryId}`, payload);
  },
  async delete (categoryId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/categories/${categoryId}`);
  },
};
