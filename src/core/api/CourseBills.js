import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const courseBills = await alenviAxios.get(`${process.env.API_HOSTNAME}/coursebills`, { params });
    return courseBills.data.data.courseBills;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/coursebills`, payload);
  },
  async update (billId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/coursebills/${billId}`, payload);
  },
};
