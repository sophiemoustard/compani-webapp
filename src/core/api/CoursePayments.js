import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/coursepayments`, payload);
  },
  async update (paymentId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/coursepayments/${paymentId}`, payload);
  },
};
