import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const courses = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses`, { params });
    return courses.data.data.courses;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses`, payload);
  },
};
