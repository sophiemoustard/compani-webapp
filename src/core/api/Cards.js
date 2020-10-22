import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (cardId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/cards/${cardId}`, payload);
  },
  async updateAnswer (params, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/cards/${params.cardId}/answers/${params.answerId}`, payload);
  },
  async deleteById (cardId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/cards/${cardId}`);
  },
};
