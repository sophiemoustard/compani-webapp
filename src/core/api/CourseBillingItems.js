import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const courseBillingItems = await alenviAxios.get(`${process.env.API_HOSTNAME}/coursebillingitems`);
    return courseBillingItems.data.data.courseBillingItems;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/coursebillingitems`, payload);
  },
};
