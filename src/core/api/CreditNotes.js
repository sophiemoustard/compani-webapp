import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  getPdf (id) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/creditNotes/${id}/pdfs`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
