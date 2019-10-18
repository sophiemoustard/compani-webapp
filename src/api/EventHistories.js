import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const eventHistories = await alenviAxios.get(`${process.env.API_HOSTNAME}/eventhistories`, { params });
    return eventHistories.data.data.eventHistories;
  },
};
