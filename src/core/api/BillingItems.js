import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/billingitems`, data);
  },
};
