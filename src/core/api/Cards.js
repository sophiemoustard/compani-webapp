import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (cardId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/cards/${cardId}`, payload);
  },
  async addAnswer (cardId) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/cards/${cardId}/answers`);
  },
  async updateAnswer (params, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/cards/${params.cardId}/answers/${params.answerId}`, payload);
  },
  async deleteAnswer (params) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/cards/${params.cardId}/answers/${params.answerId}`);
  },
  async deleteMedia (cardId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/cards/${cardId}/upload`);
  },
};
