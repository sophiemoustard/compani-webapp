import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/usercompanies`, payload);
  },
  async update (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/usercompanies/${id}`, payload);
  },
};
