import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const distanceMatrices = await alenviAxios.get(`${process.env.API_HOSTNAME}/distancematrix`, { params });
    return distanceMatrices.data.data.distanceMatrices;
  },
};
