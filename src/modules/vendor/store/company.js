import Company from '@api/Companies';

export default {
  namespaced: true,
  state: {
    company: null,
  },
  mutations: {
    SAVE: (state, data) => { state.company = !data ? data : Object.assign({}, data) },
  },
  actions: {
    get: async ({ commit }, params) => {
      try {
        const company = await Company.getById(params.companyId);
        commit('SAVE', company);
      } catch (e) {
        console.error(e);
      }
    },
    remove: ({ commit }) => { commit('SAVE', null) },
  },
}
