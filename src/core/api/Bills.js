import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getDraftBills (params = null) {
    const draftBills = await alenviAxios.get(`${process.env.API_HOSTNAME}/bills/drafts`, { params });
    return draftBills.data.data.draftBills;
  },
  async list (params) {
    const bills = await alenviAxios.get(`${process.env.API_HOSTNAME}/bills`, { params });
    return bills.data.data.bills;
  },
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/bills`, data);
  },
  async createList (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/bills/list`, data);
  },
  async getPdf (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/bills/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
