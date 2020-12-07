import { alenviAxios } from '@api/ressources/alenviAxios';
import axios from 'axios';

export default {
  async refreshToken (data) {
    const refreshToken = await axios.post(`${process.env.API_HOSTNAME}/users/refreshToken`, data);
    return refreshToken.data.data;
  },
  async authenticate (data) {
    const auth = await axios.post(`${process.env.API_HOSTNAME}/users/authenticate`, data);
    return auth.data.data;
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
    const newUser = await alenviAxios.post(`${process.env.API_HOSTNAME}/users`, data);
    return newUser.data.data.user;
  },
  async createPasswordToken (id, data) {
    const passwordToken = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${id}/create-password-token`, data);
    return passwordToken.data.data.passwordToken;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${id}`);
  },
  async updateById (userId, data) {
    const updatedUser = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}`, data);
    return updatedUser;
  },
  async updatePassword (userId, data, token = null) {
    let updatedUser;
    if (token) {
      updatedUser = await axios.put(
        `${process.env.API_HOSTNAME}/users/${userId}/password`,
        data,
        { headers: { 'x-access-token': token } }
      );
    } else {
      updatedUser = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/password`, data);
    }
    return updatedUser;
  },
  async updateCertificates (userId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/certificates`, data);
  },
  async forgotPassword (data) {
    const mailInfo = await axios.post(`${process.env.API_HOSTNAME}/users/forgot-password`, data);
    return mailInfo.data.data.mailInfo;
  },
  async checkResetPasswordToken (resetToken) {
    const check = await axios.get(`${process.env.API_HOSTNAME}/users/check-reset-password/${resetToken}`);
    return check.data.data;
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
