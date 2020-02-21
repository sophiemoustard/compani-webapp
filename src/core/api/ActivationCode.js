import { alenviAxios } from './ressources/alenviAxios'
import axios from 'axios'

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
