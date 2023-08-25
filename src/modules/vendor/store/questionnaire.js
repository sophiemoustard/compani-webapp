import Questionnaires from '@api/Questionnaires';
import { DECREMENT, INCREMENT } from '@data/constants';

export default {
  namespaced: true,
  state: {
    questionnaire: null,
    cardIndex: -1,
    answerList: [],
  },
  mutations: {
    SET_QUESTIONNAIRE: (state, data) => { state.questionnaire = data ? ({ ...data }) : data; },
    SET_CARD_INDEX: (state, data) => {
      if (data.type === INCREMENT) state.cardIndex += 1;
      if (data.type === DECREMENT) state.cardIndex -= 1;
    },
    SET_ANSWER_LIST: (state, data) => { state.answerList = [...state.answerList, ...data.answers]; },
  },
  actions: {
    fetchQuestionnaire: async ({ commit }, params) => {
      try {
        const questionnaire = await Questionnaires.getById(params.questionnaireId);
        commit('SET_QUESTIONNAIRE', questionnaire);
      } catch (e) {
        console.error(e);
      }
    },
    resetQuestionnaire: ({ commit }) => { commit('SET_QUESTIONNAIRE', null); },
    updateCardIndex: ({ commit }, data) => { commit('SET_CARD_INDEX', data); },
    setAnswerList: ({ commit }, data) => { commit('SET_ANSWER_LIST', data); },
  },
};
