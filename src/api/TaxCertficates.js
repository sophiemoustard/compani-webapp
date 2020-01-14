import { alenviAxios } from './ressources/alenviAxios'

export default {
  async list (params) {
    const taxCertificates = await alenviAxios.get(`${process.env.API_HOSTNAME}/taxcertificates`, { params });
    return taxCertificates.data.data.taxCertificates;
  },
}
