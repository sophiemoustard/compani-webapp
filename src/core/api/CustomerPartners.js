import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const customerPartners = await alenviAxios.get(`${process.env.API_HOSTNAME}/customerpartners`, { params });
    return customerPartners.data.data.customerPartners;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/customerpartners`, payload);
  },
  async update (customerPartnerId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/customerpartners/${customerPartnerId}`, payload);
  },
  async delete (customerPartnerId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/customerpartners/${customerPartnerId}`);
  },
};
