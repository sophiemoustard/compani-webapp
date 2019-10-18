import { alenviAxios } from './ressources/alenviAxios'

export default {
  async updateById (id, data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${id}`, data);
    return companyRaw.data.data;
  },
  async createInternalHour (id, payload) {
    const internalHours = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`, payload);
    return internalHours.data.data.internalHours;
  },
  async getInternalHours (id) {
    const internalHours = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}/internalHours`);
    return internalHours.data.data.internalHours;
  },
  async updateInternalHour (params, payload) {
    const internalHours = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${params.id}/internalHours/${params.internalHourId}`, payload);
    return internalHours.data.data.internalHours;
  },
  async deleteInternalHour (queries) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/companies/${queries.id}/internalHours/${queries.internalHourId}`);
  },
}
