import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    try {
      const roles = await alenviAxios.get(`${process.env.API_HOSTNAME}/roles`, { params });
      return roles.data.data.roles;
    } catch (e) {
      console.error(e);
    }
  },
}
