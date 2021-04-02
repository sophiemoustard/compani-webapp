import Questionnaires from '@api/Questionnaires';

export default {
  namespaced: true,
  state: {
    questionnaire: null,
  },
  mutations: {
    SET_QUESTIONNAIRE: (state, data) => { state.questionnaire = !data ? data : ({ ...data }); },
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
  },
};
