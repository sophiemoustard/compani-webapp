import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list () {
    const questionnaires = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires`);
    return questionnaires.data.data.questionnaires;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/questionnaires`, payload);
  },
  async getById (id) {
    const questionnaire = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires/${id}`);
    return questionnaire.data.data.questionnaire;
  },
  async update (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/questionnaires/${id}`, payload);
  },
  async addCard (questionnaireId, payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/questionnaires/${questionnaireId}/cards`, payload);
  },
  async deleteCard (cardId) {
    await alenviAxios.delete(`${process.env.API_HOSTNAME}/questionnaires/cards/${cardId}`);
  },
  async getQuestionnaireAnswers (id, params = null) {
    const questionnaire = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/questionnaires/${id}/follow-up`,
      { params }
    );
    return questionnaire.data.data.followUp;
  },
  async getQRCode (id, params = null) {
    const qrCode = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires/${id}/qrcode`, { params });

    return qrCode.data.data.qrCode;
  },
};
