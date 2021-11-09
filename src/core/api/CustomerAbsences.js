import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const customerAbsences = await alenviAxios.get(`${process.env.API_HOSTNAME}/customerabsences`, { params });
    return customerAbsences.data.data.customerAbsences;
  },
};
