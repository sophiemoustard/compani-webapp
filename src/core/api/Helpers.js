import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const helpers = await alenviAxios.get(`${process.env.API_HOSTNAME}/helpers`, { params });
    return helpers.data.data.helpers;
  },
  async update (helperId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/helpers/${helperId}`, payload);
  },
};
