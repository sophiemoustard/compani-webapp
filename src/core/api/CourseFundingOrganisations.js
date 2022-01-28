import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const courseFundingOrganisations = await alenviAxios
      .get(`${process.env.API_HOSTNAME}/coursefundingorganisations`, { params });
    return courseFundingOrganisations.data.data.courseFundingOrganisations;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/coursefundingorganisations`, payload);
  },
};
