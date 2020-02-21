import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (id, data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${id}`, data);
    return companyRaw.data.data;
  },
  async getFirstIntervention () {
    const companyRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/first-intervention`);
    return companyRaw.data.data.firstIntervention;
  },
}
