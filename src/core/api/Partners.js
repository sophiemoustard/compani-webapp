import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const partners = await alenviAxios.get(`${process.env.API_HOSTNAME}/partners`);
    return partners.data.data.partners;
  },
  async updateById (partnerId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/partners/${partnerId}`, payload);
  },
};
