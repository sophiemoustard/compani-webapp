import { alenviAxios } from '@api/ressources/alenviAxios'
import axios from 'axios'

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
  async getById (id) {
    const userRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${id}`);
    return userRaw.data.data.user;
  },
  async create (data) {
    const newUser = await alenviAxios.post(`${process.env.API_HOSTNAME}/users`, data);
    return newUser.data.data.user;
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/users/${id}`);
  },
  async updateById (userId, data, token = null) {
    let updatedUser;
    if (token === null) {
      updatedUser = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}`, data);
    } else {
      updatedUser = await axios.put(`${process.env.API_HOSTNAME}/users/${userId}`, data, { headers: { 'x-access-token': token } });
    }
    return updatedUser;
  },
  async updateCertificates (userId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/certificates`, data);
  },
  async forgotPassword (data) {
    const mailInfo = await axios.post(`${process.env.API_HOSTNAME}/users/forgotPassword`, data);
    return mailInfo.data.data.mailInfo;
  },
  async checkResetPasswordToken (resetToken) {
    const check = await axios.get(`${process.env.API_HOSTNAME}/users/checkResetPassword/${resetToken}`);
    return check.data.data;
  },
  async createDriveFolder (userId, data) {
    const driveFolder = await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${userId}/drivefolder`, data);
    return driveFolder;
  },
  // Tasks
  async updateTask ({ userId, taskId }, data) {
    const updatedTask = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/tasks/${taskId}`, data)
    return updatedTask;
  },
  async getTasks (userId) {
    const tasks = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${userId}/tasks`);
    return tasks.data.data.tasks;
  },
}
