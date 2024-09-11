import { alenviAxios } from '@api/ressources/alenviAxios';
import { WEBAPP } from '@data/constants';

export default {
  async list (params = null) {
    try {
      const usersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      return usersRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async learnerList (params = null) {
    const learners = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/learners`, { params });
    return learners.data.data.users;
  },
  async getById (id) {
    const userRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${id}`);
    return userRaw.data.data.user;
  },
  async exists (params) {
    const exists = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/exists`, { params });
    return exists.data.data;
  },
  async create (data) {
    const newUser = await alenviAxios.post(`${process.env.API_HOSTNAME}/users`, { ...data, origin: WEBAPP });
    return newUser.data.data.user;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${id}`);
  },
  async updateById (userId, data) {
    const updatedUser = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}`, data);
    return updatedUser;
  },
  async uploadImage (userId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${userId}/upload`, payload);
  },
  async deleteImage (userId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${userId}/upload`);
  },
};
