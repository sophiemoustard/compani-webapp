import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async addActivity (moduleId, payload) {
    const module = await alenviAxios.post(`${process.env.API_HOSTNAME}/modules/${moduleId}/activity`, payload);
    return module.data.data.module;
  },
};
