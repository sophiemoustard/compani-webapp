import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const trainingContracts = await alenviAxios.get(`${process.env.API_HOSTNAME}/trainingcontracts`, { params });
    return trainingContracts.data.data.trainingContracts;
  },
  upload () {
    return `${process.env.API_HOSTNAME}/trainingcontracts`;
  },
};
