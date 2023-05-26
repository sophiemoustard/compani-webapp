import Holding from '@api/Holdings';

export default {
  namespaced: true,
  state: {
    holding: null,
  },
  mutations: {
    SET_HOLDING: (state, data) => { state.holding = data ? ({ ...data }) : data; },
  },
  actions: {
    fetchHolding: async ({ commit }, params) => {
      try {
        const holding = await Holding.getById(params.holdingId);
        commit('SET_HOLDING', holding);
      } catch (e) {
        console.error(e);
      }
    },
    resetHolding: ({ commit }) => { commit('SET_HOLDING', null); },
  },
};
