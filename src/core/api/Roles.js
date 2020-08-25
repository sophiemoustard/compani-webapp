import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    try {
      const roles = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`, { params });
      return roles.data.data.roles;
    } catch (e) {
      console.error(e);
    }
  },
};
