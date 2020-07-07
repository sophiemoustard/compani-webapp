import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async addActivity (moduleId, payload) {
    const program = await alenviAxios.post(`${process.env.API_HOSTNAME}/modules/${moduleId}/activity`, payload);
    return program.data.data.program;
  },
};
