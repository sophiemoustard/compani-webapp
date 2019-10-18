import { alenviAxios } from './ressources/alenviAxios'

export default {
  async sendSMS (data) {
    const res = await alenviAxios.post(`${process.env.API_HOSTNAME}/sms`, data);
    return res;
  },
}
