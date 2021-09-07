import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const companyLinkRequests = await alenviAxios.get(`${process.env.API_HOSTNAME}/companylinkrequests`);
    return companyLinkRequests.data.data.companyLinkRequests;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companylinkrequests/${id}`);
  },
};
