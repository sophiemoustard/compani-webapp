import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const trainingContracts = await alenviAxios.get(`${process.env.API_HOSTNAME}/trainingcontracts`, { params });
    return trainingContracts.data.data.trainingContracts;
  },
  getTrainingContractUploadURL () {
    return `${process.env.API_HOSTNAME}/trainingcontracts`;
  },
  async delete (trainingContractId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/trainingcontracts/${trainingContractId}`);
  },
  async create (payload) {
    await alenviAxios.post(this.getTrainingContractUploadURL(), payload);
  },
};
