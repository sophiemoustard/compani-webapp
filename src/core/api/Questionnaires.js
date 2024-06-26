import axios from 'axios';
import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async list (params) {
    const questionnaires = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires`, { params });
    return questionnaires.data.data.questionnaires;
  },
  async create (payload) {
    await alenviAxios.post(`${process.env.API_HOSTNAME}/questionnaires`, payload);
  },
  async getById (id) {
    const questionnaire = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires/${id}`);
    return questionnaire.data.data.questionnaire;
  },
  async getFromNotLogged (params) {
    const questionnaires = await axios.get(`${process.env.API_HOSTNAME}/questionnaires`, { params });
    return questionnaires.data.data.questionnaires;
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
    const questionnaireAnswers = await alenviAxios.get(
      `${process.env.API_HOSTNAME}/questionnaires/${id}/follow-up`,
      { params }
    );

    return questionnaireAnswers.data.data;
  },
  async getQRCode (params = null) {
    const qrCode = await alenviAxios.get(`${process.env.API_HOSTNAME}/questionnaires/qrcode`, { params });

    return qrCode.data.data.qrCode;
  },
};
