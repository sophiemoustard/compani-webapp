import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const courses = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses`, { params });
    return courses.data.data.courses;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses`, payload);
  },
  async getById (courseId) {
    const course = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}`);
    return course.data.data.course;
  },
  async update (courseId, payload) {
    const course = await alenviAxios.put(`${process.env.API_HOSTNAME}/courses/${courseId}`, payload);
    return course.data.data.course;
  },
  async addTrainee (courseId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses/${courseId}/trainees`, payload);
  },
};
