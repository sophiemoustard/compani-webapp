import { Cookies } from 'quasar';
import { alenviAxios } from './ressources/alenviAxios';

export default {
  async showAll (params) {
    const creditNotes = await alenviAxios.get(`${process.env.API_HOSTNAME}/creditNotes`, { params });
    return creditNotes.data.data.creditNotes;
  },
  async create (payload) {
    const creditNote = await alenviAxios.post(`${process.env.API_HOSTNAME}/creditNotes`, payload);
    return creditNote.data.data.creditNote;
  },
  async updateById (id, payload) {
    const creditNote = await alenviAxios.put(`${process.env.API_HOSTNAME}/creditNotes/${id}`, payload);
    return creditNote.data.data.creditNote;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/creditNotes/${id}`);
  },
  getPDFUrl (id) {
    return `${process.env.API_HOSTNAME}/creditNotes/${id}/pdfs?x-access-token=${Cookies.get('alenvi_token')}`;
  },
}
