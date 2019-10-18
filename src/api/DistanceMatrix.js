import { alenviAxios } from './ressources/alenviAxios';

export default {
  async list (params = null) {
    const distanceMatrix = await alenviAxios.get(`${process.env.API_HOSTNAME}/distancematrix`, { params });
    return distanceMatrix.data.data.distanceMatrix;
  },
};
