import Company from '@api/Companies';

export default {
  namespaced: true,
  state: {
    company: null,
  },
  mutations: {
    SET_COMPANY: (state, data) => { state.company = data ? ({ ...data }) : data; },
  },
  actions: {
    fetchCompany: async ({ commit }, params) => {
      try {
        const company = await Company.getById(params.companyId);
        commit('SET_COMPANY', company);
      } catch (e) {
        console.error(e);
      }
    },
    resetCompany: ({ commit }) => { commit('SET_COMPANY', null); },
  },
};
