import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/billingitems`, data);
  },
  async list () {
    const billingItems = await alenviAxios.get(`${process.env.API_HOSTNAME}/billingitems`);
    return billingItems.data.data;
  },
};
