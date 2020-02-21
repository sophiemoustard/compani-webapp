import { alenviAxios } from './ressources/alenviAxios'

export default {
  async getCsv (params) {
    return alenviAxios({
      url: `${process.env.API_HOSTNAME}/exports/${params.type}/data`,
      method: 'GET',
      responseType: 'blob',
    });
  },
  async getHistoryCsv (params) {
    return alenviAxios({
      url: `${process.env.API_HOSTNAME}/exports/${params.type}/history`,
      method: 'GET',
      responseType: 'blob',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
      },
    });
  },
}
