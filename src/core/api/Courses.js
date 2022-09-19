import { alenviAxios } from '@api/ressources/alenviAxios';
import { WEBAPP, OPERATIONS } from '@data/constants';

export default {
  async list (filterParams) {
    const params = { ...filterParams, origin: WEBAPP, action: OPERATIONS };
    const courses = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses`, { params });
    return courses.data.data.courses;
  },
  async listUserCourse (params) {
    const courses = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/user`, { params });
    return courses.data.data.courses;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses`, payload);
  },
  async getById (courseId) {
    const params = { action: OPERATIONS };
    const course = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}`, { params });
    return course.data.data.course;
  },
  async getFollowUp (courseId, params = null) {
    const course = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}/follow-up`, { params });
    return course.data.data.followUp;
  },
  async getQuestionnaireAnswers (courseId) {
    const course = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}/activities`);
    return course.data.data.questionnaireAnswers;
  },
  async getCourseQuestionnaires (courseId) {
    const course = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}/questionnaires`);
    return course.data.data.questionnaires;
  },
  async update (courseId, payload) {
    const course = await alenviAxios.put(`${process.env.API_HOSTNAME}/courses/${courseId}`, payload);
    return course.data.data.course;
  },
  async delete (courseId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/courses/${courseId}`);
  },
  async sendSMS (courseId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses/${courseId}/sms`, payload);
  },
  async getSMSHistory (courseId, payload) {
    const sms = await alenviAxios.get(`${process.env.API_HOSTNAME}/courses/${courseId}/sms`);
    return sms.data.data.sms;
  },
  async addTrainee (courseId, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/courses/${courseId}/trainees`, payload);
  },
  async deleteTrainee (courseId, traineeId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/courses/${courseId}/trainees/${traineeId}`);
  },
  downloadAttendanceSheet (courseId) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/courses/${courseId}/attendance-sheets`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
  downloadCompletionCertificates (courseId) {
    return alenviAxios.get(
      `${process.env.API_HOSTNAME}/courses/${courseId}/completion-certificates`,
      { responseType: 'arraybuffer', headers: { Accept: 'application/zip' } }
    );
  },
  async addAccessRule (courseId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/courses/${courseId}/accessrules`, payload);
  },
  async deleteAccessRule (courseId, accessRuleId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/courses/${courseId}/accessrules/${accessRuleId}`);
  },
  getConvocationUrl (courseId) {
    return `${process.env.API_HOSTNAME}/courses/${courseId}/convocations`;
  },
  async downloadConvocation (courseId) {
    return alenviAxios.get(
      this.getConvocationUrl(courseId),
      { responseType: 'arraybuffer', headers: { Accept: 'application/pdf' } }
    );
  },
};
