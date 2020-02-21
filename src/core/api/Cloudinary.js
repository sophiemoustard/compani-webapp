import { alenviAxios } from './ressources/alenviAxios';

export default {
  async deleteImageById (params) {
    const file = await alenviAxios.delete(`${process.env.API_HOSTNAME}/cloudinary/image/${encodeURIComponent(params.id)}`);
    return file;
  },
}
