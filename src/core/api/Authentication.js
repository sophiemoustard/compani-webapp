import axios from 'axios';
import { alenviAxios } from '@api/ressources/alenviAxios';

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
  async checkPasswordToken (resetToken) {
    const check = await axios.get(
      `${process.env.API_HOSTNAME}/users/passwordtoken/${resetToken}`,
      { withCredentials: true }
    );
    return check.data.data;
  },
  async createPasswordToken (id, data) {
    const passwordToken = await alenviAxios.post(`${process.env.API_HOSTNAME}/users/${id}/passwordtoken`, data);
    return passwordToken.data.data.passwordToken;
  },
  async updatePassword (userId, data) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/users/${userId}/password`, data);
  },
};
