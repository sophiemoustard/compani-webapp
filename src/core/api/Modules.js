import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (moduleId, payload) {
    const module = await alenviAxios.put(`${process.env.API_HOSTNAME}/modules/${moduleId}`, payload);
    return module.data.data.module;
  },
  async addActivity (moduleId, payload) {
    const module = await alenviAxios.post(`${process.env.API_HOSTNAME}/modules/${moduleId}/activity`, payload);
    return module.data.data.module;
  },
};
