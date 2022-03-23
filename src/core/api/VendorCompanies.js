import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async get () {
    const vendorCompany = await alenviAxios.get(`${process.env.API_HOSTNAME}/vendorcompanies`);
    return vendorCompany.data.data;
  },
};
