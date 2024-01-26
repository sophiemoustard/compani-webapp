import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/trainermissions`, payload);
  },
  async list (params) {
    const trainerMissions = await alenviAxios.get(`${process.env.API_HOSTNAME}/trainermissions`, { params });
    return trainerMissions.data.data.trainerMissions;
  },
  async update (trainerMissionId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/trainermissions/${trainerMissionId}`, payload);
  },
};
