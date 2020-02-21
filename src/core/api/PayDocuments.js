
import { alenviAxios } from './ressources/alenviAxios'

export default {
  async create (formData) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/paydocuments`, formData);
  },
  async list (params) {
    const payDocumentsRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/paydocuments`, { params });
    return payDocumentsRaw.data.data.payDocuments;
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/paydocuments/${id}`);
  },
}
