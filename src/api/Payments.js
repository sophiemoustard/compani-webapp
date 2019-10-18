import moment from 'moment'
import { alenviAxios } from './ressources/alenviAxios'
import { downloadFile } from '../helpers/downloadFile'

export default {
  async list (params) {
    const payments = await alenviAxios.get(`${process.env.API_HOSTNAME}/payments`, { params });
    return payments.data.data.payments;
  },
  async create (data) {
    const payment = await alenviAxios.post(`${process.env.API_HOSTNAME}/payments`, data);
    return payment.data.data.payment;
  },
  async createList (data) {
    const file = await alenviAxios({
      url: `${process.env.API_HOSTNAME}/payments/createlist`,
      method: 'POST',
      responseType: 'blob',
      data,
    });
    return downloadFile(file, `prélèvements_${moment().format('YYYYMMDD_HHmm')}.xml`);
  },
  async update (id, data) {
    const payment = await alenviAxios.put(`${process.env.API_HOSTNAME}/payments/${id}`, data);
    return payment.data.data.payment;
  },
}
