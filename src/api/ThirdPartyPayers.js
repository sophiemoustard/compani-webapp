import { alenviAxios } from './ressources/alenviAxios'

export default {
  async create (data) {
    const newThirdPartyPayer = await alenviAxios.post(`${process.env.API_HOSTNAME}/thirdpartypayers`, data);
    return newThirdPartyPayer.data.data.thirdPartyPayer;
  },
  async showAll (params) {
    const thirdPartyPayers = await alenviAxios.get(`${process.env.API_HOSTNAME}/thirdpartypayers`, { params });
    return thirdPartyPayers.data.data.thirdPartyPayers;
  },
  async removeById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/thirdpartypayers/${id}`);
  },
  async updateById (id, payload) {
    const thirdPartyPayer = await alenviAxios.put(`${process.env.API_HOSTNAME}/thirdpartypayers/${id}`, payload);
    return thirdPartyPayer.data.data.thirdPartyPayer;
  },
}
