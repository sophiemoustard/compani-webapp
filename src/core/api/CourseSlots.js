import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courseslots`, payload);
  },
  async update (slotId, payload) {
    const courseSlot = await alenviAxios.put(`${process.env.API_HOSTNAME}/courseslots/${slotId}`, payload);
    return courseSlot.data.data.courseSlot;
  },
  async delete (slotId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/courseslots/${slotId}`);
  },
};
