import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const activityHistories = await alenviAxios.get(`${process.env.API_HOSTNAME}/activityhistories`, { params });

    return activityHistories.data.data.activityHistories;
  },
};
