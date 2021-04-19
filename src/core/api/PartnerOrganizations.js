import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/partnerorganizations`, payload);
  },
  async list () {
    const partnerOrganizations = await alenviAxios.get(`${process.env.API_HOSTNAME}/partnerorganizations`);
    return partnerOrganizations.data.data.partnerOrganizations;
  },
  async getById (id) {
    const partnerOrganization = await alenviAxios.get(`${process.env.API_HOSTNAME}/partnerorganizations/${id}`);
    return partnerOrganization.data.data.partnerOrganization;
  },
  async updateById (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/partnerorganizations/${id}`, payload);
  },
  async createPartner (id, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/partnerorganizations/${id}/partners`, payload);
  },
};
