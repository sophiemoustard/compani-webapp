import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const attendanceSheets = await alenviAxios.get(`${process.env.API_HOSTNAME}/attendancesheets`, { params });
    return attendanceSheets.data.data.attendanceSheets;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/attendancesheets`, payload);
  },
  async delete (attendanceSheetId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/attendancesheets/${attendanceSheetId}`);
  },
};
