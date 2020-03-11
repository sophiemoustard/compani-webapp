import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const programs = await alenviAxios.get(`${process.env.API_HOSTNAME}/programs`, { params });
    return programs.data.data.programs;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/programs`, payload);
  },
  async getById (programId) {
    const program = await alenviAxios.get(`${process.env.API_HOSTNAME}/programs/${programId}`);
    return program.data.data.program;
  },
  async update (programId, payload) {
    const program = await alenviAxios.put(`${process.env.API_HOSTNAME}/programs/${programId}`, payload);
    return program.data.data.program;
  },
};
