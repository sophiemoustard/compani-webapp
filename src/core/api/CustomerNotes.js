import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const customerNotes = await alenviAxios.get(`${process.env.API_HOSTNAME}/customernotes`, { params });
    return customerNotes.data.data.customerNotes;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/customernotes`, payload);
  },
  async update (customerNoteId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/customernotes/${customerNoteId}`, payload);
  },
};
