import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async update (subProgramId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/subprograms/${subProgramId}`, payload);
  },
};
