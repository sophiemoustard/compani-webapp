import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/billingitems`, data);
  },
  async list (params) {
    const billingItems = await alenviAxios.get(`${process.env.API_HOSTNAME}/billingitems`, { params });
    return billingItems.data.data.billingItems;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/billingitems/${id}`);
  },
};
