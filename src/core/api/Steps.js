import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (stepId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/steps/${stepId}`, payload);
  },
  async addActivity (stepId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/steps/${stepId}/activity`, payload);
  },
};
