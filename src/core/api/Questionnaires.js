import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const questionnaires = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires`);
    return questionnaires.data.data.questionnaires;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/questionnaires`, payload);
  },
};
