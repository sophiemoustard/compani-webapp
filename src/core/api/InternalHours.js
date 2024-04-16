import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/internalhours`, { params });
    return internalHours.data.data.internalHours;
  },
};
