import axios from 'axios';
import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (params) {
    const activationCode = await alenviAxios.post(`${process.env.API_HOSTNAME}/activation`, params);
    return activationCode.data.data.activationCode;
  },
  async check (code) {
    const activationCode = await axios.get(`${process.env.API_HOSTNAME}/activation/${code}`);
    return activationCode.data.data.activationCode;
  },
}
