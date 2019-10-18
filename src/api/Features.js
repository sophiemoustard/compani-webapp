import { alenviAxios } from './ressources/alenviAxios'

export default {
  async showAll (params) {
    try {
      const features = await alenviAxios.get(`${process.env.API_HOSTNAME}/features`, { params });
      return features.data.data.features;
    } catch (e) {
      console.error(e);
    }
  },
}
