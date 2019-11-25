import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

export default {
  async list (params = null) {
    try {
      const usersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/users`, { params });
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
  async updateById (data, token = null) {
    let updatedUser;
    if (token === null) {
      updatedUser = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data);
    } else {
      updatedUser = await axios.put(`${process.env.API_HOSTNAME}/users/${data._id}`, data, { headers: { 'x-access-token': token } });
    }
    return updatedUser;
  },
  async updateCertificates (data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data._id}/certificates`, data);
  },
  async getRoles () {
    const rolesRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`);
    return rolesRaw.data.data.roles;
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
  async updateTask (data) {
    const updatedTask = await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${data.user_id}/tasks/${data.task_id}`, data)
    return updatedTask;
  },
  async getTasks (userId) {
    const tasks = await alenviAxios.get(`${process.env.API_HOSTNAME}/users/${userId}/tasks`);
    return tasks.data.data.tasks;
  },
}
