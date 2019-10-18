import { alenviAxios } from './ressources/alenviAxios';

export default {
  // Contracts
  async create (payload) {
    const contact = await alenviAxios.post(`${process.env.API_HOSTNAME}/contracts`, payload);
    return contact.data.data.contract;
  },
  async update (contractId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/contracts/${contractId}`, payload);
  },
  async list (params) {
    const contracts = await alenviAxios.get(`${process.env.API_HOSTNAME}/contracts`, { params });
    return contracts.data.data.contracts;
  },
  // Contracts version
  async updateVersion (params, payload) {
    const contract = await alenviAxios.put(`${process.env.API_HOSTNAME}/contracts/${params.contractId}/versions/${params.versionId}`, payload);
    return contract.data.data.contract;
  },
  async createVersion (contractId, payload) {
    const contract = await alenviAxios.post(`${process.env.API_HOSTNAME}/contracts/${contractId}/versions`, payload);
    return contract.data.data.contract;
  },
  async deleteVersion (contractId, versionId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/contracts/${contractId}/versions/${versionId}`);
  },
  async getStaffRegister () {
    const staffRegister = await alenviAxios.get(`${process.env.API_HOSTNAME}/contracts/staff-register`);
    return staffRegister.data.data.staffRegister;
  },
};
