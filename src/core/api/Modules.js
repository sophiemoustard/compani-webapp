import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (moduleId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/modules/${moduleId}`, payload);
  },
  async addActivity (moduleId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/modules/${moduleId}/activity`, payload);
  },
};
