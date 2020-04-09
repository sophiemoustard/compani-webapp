import { Cookies } from 'quasar';
import { alenviAxios } from '@api/ressources/alenviAxios';
import axios from 'axios'

export default {
  async list (params) {
    const courses = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses`, { params });
    return courses.data.data.courses;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses`, payload);
  },
  async getById (courseId) {
    const course = await axios.get(`${process.env.API_HOSTNAME}/courses/${courseId}`);
    return course.data.data.course;
  },
  async update (courseId, payload) {
    const course = await alenviAxios.put(`${process.env.API_HOSTNAME}/courses/${courseId}`, payload);
    return course.data.data.course;
  },
  async sendSMS (courseId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses/${courseId}/sms`, payload);
  },
  async addTrainee (courseId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses/${courseId}/trainees`, payload);
  },
  async deleteTrainee (courseId, traineeId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/courses/${courseId}/trainees/${traineeId}`);
  },
  downloadAttendanceSheet (courseId) {
    return `${process.env.API_HOSTNAME}/courses/${courseId}/attendancesheets?x-access-token=${Cookies.get('alenvi_token')}`;
  },
};
