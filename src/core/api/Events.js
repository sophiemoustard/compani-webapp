import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params = null) {
    const events = await alenviAxios.get(`${process.env.API_HOSTNAME}/events`, { params });
    return events.data.data.events;
  },
  async listForCreditNotes (params = null) {
    const events = await alenviAxios.get(`${process.env.API_HOSTNAME}/events/credit-notes`, { params });
    return events.data.data.events;
  },
  async create (data) {
    const event = await alenviAxios.post(`${process.env.API_HOSTNAME}/events`, data);
    return event.data.data.event;
  },
  async deleteList (params = null) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/events`, { params });
  },
  async deleteById (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/events/${id}`);
  },
  async deleteRepetition (id) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/events/${id}/repetition`);
  },
  async updateById (id, payload) {
    const event = await alenviAxios.put(`${process.env.API_HOSTNAME}/events/${id}`, payload);
    return event.data.data.event;
  },
  async workingStats (params = null) {
    const workingStats = await alenviAxios.get(`${process.env.API_HOSTNAME}/events/working-stats`, { params });
    return workingStats.data.data.workingStats;
  },
};
