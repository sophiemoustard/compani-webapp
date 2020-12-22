import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const creditNotes = await alenviAxios.get(`${process.env.API_HOSTNAME}/creditNotes`, { params });
    return creditNotes.data.data.creditNotes;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/creditNotes`, payload);
  },
  async updateById (id, payload) {
    const creditNote = await alenviAxios.put(`${process.env.API_HOSTNAME}/creditNotes/${id}`, payload);
    return creditNote.data.data.creditNote;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/creditNotes/${id}`);
  },
  getPdf (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/creditNotes/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
