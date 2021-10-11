import { alenviAxios } from '@api/ressources/alenviAxios';
import { downloadFile } from '@helpers/file';

export default {
  async downloadDeliveryFile (params) {
    const file = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/teletransmission/delivery`,
      { responseType: 'blob', headers: { Accept: 'application/xml' }, params }
    );

    return downloadFile(file);
  },
};
