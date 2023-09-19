import Questionnaires from '@api/Questionnaires';
import { DECREMENT, INCREMENT, GO_TO_CARD } from '@data/constants';
import { START_CARD_INDEX } from '../../../core/data/constants';

export default {
  namespaced: true,
  state: {
    questionnaire: null,
    cardIndex: START_CARD_INDEX,
    answerList: [],
    isFromEndCard: false,
  },
  mutations: {
    SET_QUESTIONNAIRE: (state, data) => { state.questionnaire = data ? ({ ...data }) : data; },
    SET_CARD_INDEX: (state, data) => {
      if (data.type === INCREMENT) state.cardIndex += 1;
      if (data.type === DECREMENT) state.cardIndex -= 1;
      if (data.type === GO_TO_CARD) {
        state.cardIndex = data.index;
        if (data.index === START_CARD_INDEX) state.isFromEndCard = true;
      }
    },
    SET_ANSWER_LIST: (state, data) => {
      const allCardAnsweredIds = state.answerList.map(a => a.card);

      for (const resp of data.answers) {
        // Prevents duplication: if the user answers and then navigates between pages using the "back"
        // button and modifies his answers + unsaved answers if they are empty
        if (allCardAnsweredIds.includes(resp.card)) {
          const oldResponse = state.answerList.find(a => a.card === resp.card);
          const oldResponseIndex = state.answerList.indexOf(oldResponse);

          if (resp.answerList[0]) state.answerList[oldResponseIndex] = resp;
          else state.answerList.splice(oldResponseIndex, 1);
        } else if (resp.answerList[0]) state.answerList.push(resp);
      }
    },
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
