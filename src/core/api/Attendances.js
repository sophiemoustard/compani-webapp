import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const attendanceSheets = await alenviAxios.get(`${process.env.API_HOSTNAME}/attendances`, { params });
    return attendanceSheets.data.data.attendances;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/attendances`, payload);
  },
  async delete (attendanceId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/attendances/${attendanceId}`);
  },
};
