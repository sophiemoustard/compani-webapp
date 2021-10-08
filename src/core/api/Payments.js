import { alenviAxios } from '@api/ressources/alenviAxios';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';

export default {
  async create (data) {
    const payment = await alenviAxios.post(`${process.env.API_HOSTNAME}/payments`, data);
    return payment.data.data.payment;
  },
  async createList (data) {
    const file = await alenviAxios({
      url: `${process.env.API_HOSTNAME}/payments/list`,
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
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/payments/${id}`);
  },
};
