import { Cookies } from 'quasar';
import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const billSlips = await alenviAxios.get(`${process.env.API_HOSTNAME}/billslips`, { params });
    return billSlips.data.data.billSlips;
  },
  getPDFUrl (id) {
    return `${process.env.API_HOSTNAME}/billslips/${id}/docx?x-access-token=${Cookies.get('alenvi_token')}`;
  },
}
