import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async downloadDeliveryFile (params) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/teletransmission/delivery`,
      { responseType: 'blob', headers: { Accept: 'application/xml' }, params }
    );
  },
};
