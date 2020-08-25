import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async send (data) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/sms`, data);
  },
};
