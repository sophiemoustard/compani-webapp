import { alenviAxios } from '@api/ressources/alenviAxios'

export default {
  async updateById (activityId, payload) {
    const activity = await alenviAxios.put(`${process.env.API_HOSTNAME}/activities/${activityId}`, payload);
    return activity.data.data.activity;
  },
}
