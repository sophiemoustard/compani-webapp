import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getDistanceMatrix (params) {
    const direction = await alenviAxios.get(`${process.env.API_HOSTNAME}/google/maps/distancematrix`, { params });
    return direction.data.data;
  },
}
