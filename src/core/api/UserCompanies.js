import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async update (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/usercompanies/${id}`, payload);
  },
};
