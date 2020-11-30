import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/internalhours`, payload);
  },
  async list (params) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/internalhours`, { params });
    return internalHours.data.data.internalHours;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/internalhours/${id}`);
  },
};
