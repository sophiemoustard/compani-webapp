import { alenviAxios } from '@api/ressources/alenviAxios'

export default {
  async updateById (activityId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/activities/${activityId}`, payload);
  },
}
