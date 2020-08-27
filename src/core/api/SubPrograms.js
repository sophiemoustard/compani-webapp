import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async update (subProgramId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/subprograms/${subProgramId}`, payload);
  },
  async addStep (subProgramId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/subprograms/${subProgramId}/steps`, payload);
  },
  async detachStep (subProgramId, stepId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/subprograms/${subProgramId}/steps/${stepId}`);
  },
};
