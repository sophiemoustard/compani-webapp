export default {
  namespaced: true,
  state: {
    card: null,
  },
  mutations: {
    SET_CARD: (state, data) => { state.card = data ? ({ ...data }) : data; },
  },
  actions: {
    fetchCard: ({ commit }, card) => { commit('SET_CARD', card); },
    resetCard: ({ commit }) => { commit('SET_CARD', null); },
  },
};
