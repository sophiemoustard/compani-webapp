import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const administrativedocuments = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/administrativedocuments`,
      { params }
    );
    return administrativedocuments.data.data.administrativeDocuments;
  },
  async create (data) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/administrativedocuments`, data);
  },
  async remove (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/administrativedocuments/${id}`);
  },
};
