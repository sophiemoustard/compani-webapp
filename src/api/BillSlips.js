import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const billSlips = await alenviAxios.get(`${process.env.API_HOSTNAME}/billslips`, { params });
    return billSlips.data.data.billSlips;
  },
}
