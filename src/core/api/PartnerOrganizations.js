import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/partnerorganizations`, payload);
  },
  async list () {
    const partnerOrganizations = await alenviAxios.get(`${process.env.API_HOSTNAME}/partnerorganizations`);
    return partnerOrganizations.data.data.partnerOrganizations;
  },
  async getById (partnerOrganizationId) {
    const partnerOrganization = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/partnerorganizations/${partnerOrganizationId}`
    );
    return partnerOrganization.data.data.partnerOrganization;
  },
};
