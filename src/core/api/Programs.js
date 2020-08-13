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
    await alenviAxios.put(`${process.env.API_HOSTNAME}/programs/${programId}`, payload);
  },
  async addSubProgram (programId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/programs/${programId}/subprograms`, payload);
  },
  async addStep (programId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/programs/${programId}/steps`, payload);
  },
};
