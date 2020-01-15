import { Cookies } from 'quasar';
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async list (params) {
    const taxCertificates = await alenviAxios.get(`${process.env.API_HOSTNAME}/taxcertificates`, { params });
    return taxCertificates.data.data.taxCertificates;
  },
  getPDFUrl (id) {
    return `${process.env.API_HOSTNAME}/taxcertificates/${id}/pdfs?x-access-token=${Cookies.get('alenvi_token')}`;
  },
}
