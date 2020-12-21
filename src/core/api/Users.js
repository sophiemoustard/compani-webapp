import axios from 'axios';
import { alenviAxios } from '@api/ressources/alenviAxios';
import { WEBAPP } from '@data/constants';

export default {
  async refreshToken (data) {
    await axios.post(`${process.env.API_HOSTNAME}/users/refreshToken`, data, { withCredentials: true });
  },
  async authenticate (data) {
    const auth = await axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, data, { withCredentials: true });
    return auth.data.data;
  },
  async logOut () {
    await axios.post(`${process.env.API_HOSTNAME}/users/logout`, null, { withCredentials: true });
  },
  async forgotPassword (data) {
    await axios.post(`${process.env.API_HOSTNAME}/users/forgot-password`, data);
  },
  async checkResetPasswordToken (resetToken) {
    const check = await axios.get(
      `${process.env.API_HOSTNAME}/users/check-reset-password/${resetToken}`,
      { withCredentials: true }
    );
    return check.data.data;
  },
  async createPasswordToken (id, data) {
    const passwordToken = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${id}/create-password-token`, data);
    return passwordToken.data.data.passwordToken;
  },
  async updatePassword (userId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/password`, data);
  },
  async list (params = null) {
    try {
      const usersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
      return usersRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async listWithSectorHistories (params = null) {
    try {
      const usersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/sector-histories`, { params });
      return usersRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async listActive (params = null) {
    try {
      const usersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/active`, { params });
      return usersRaw.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
  },
  async learnerList (params = null) {
    try {
      const learners = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/learners`, { params });
      return learners.data.data.users;
    } catch (e) {
      console.error(e.response);
    }
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
  async updateCertificates (userId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/certificates`, data);
  },
  async createDriveFolder (userId) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${userId}/drivefolder`);
  },
  async uploadImage (userId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${userId}/upload`, payload);
  },
  async deleteImage (userId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${userId}/upload`);
  },
};
