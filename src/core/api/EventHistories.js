import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params = null) {
    const eventHistories = await alenviAxios.get(`${process.env.API_HOSTNAME}/eventhistories`, { params });
    return eventHistories.data.data.eventHistories;
  },
  async updateById (eventHistoryId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/eventhistories/${eventHistoryId}`, payload);
  },
};
