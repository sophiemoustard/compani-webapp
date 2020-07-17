import { alenviAxios } from '@api/ressources/alenviAxios'

export default {
  async getById (activityId) {
    const activity = await alenviAxios.get(`${process.env.API_HOSTNAME}/activities/${activityId}`);
    return activity.data.data.activity;
  },
  async updateById (activityId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/activities/${activityId}`, payload);
  },
  async addActivity (activityId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/activities/${activityId}/card`, payload);
  },
}
