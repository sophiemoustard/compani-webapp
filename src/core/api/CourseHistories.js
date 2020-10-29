import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async getCourseHistories (params) {
    const courseHistories = await alenviAxios.get(`${process.env.API_HOSTNAME}/coursehistories`, { params });
    return courseHistories.data.data.courseHistories;
  },
};
