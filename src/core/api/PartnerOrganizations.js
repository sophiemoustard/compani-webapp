import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async createPartnerOrganization (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/partnerorganizations`, payload);
  },
};
