import { alenviAxios } from './ressources/alenviAxios'

export default {
  async create (payload) {
    const internalHours = await alenviAxios.post(`${process.env.API_HOSTNAME}/internalhours`, payload);
    return internalHours.data.data.internalHour;
  },
  async list () {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/internalhours`);
    return internalHours.data.data.internalHours;
  },
  async update (id, payload) {
    const internalHours = await alenviAxios.put(`${process.env.API_HOSTNAME}/internalhours/${id}`, payload);
    return internalHours.data.data.internalHour;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/internalhours/${id}`);
  },
}
