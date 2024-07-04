import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async listForCreditNotes (params = null) {
    const events = await alenviAxios.get(`${process.env.API_HOSTNAME}/events/credit-notes`, { params });
    return events.data.data.events;
  },
};
