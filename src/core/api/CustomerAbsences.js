import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const customerAbsences = await alenviAxios.get(`${process.env.API_HOSTNAME}/customerabsences`, { params });
    return customerAbsences.data.data.customerAbsences;
  },
  async updateById (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/customerabsences/${id}`, payload);
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/customerabsences/${id}`);
  },
};
