import Programs from '@api/Programs';

export default {
  namespaced: true,
  state: {
    program: null,
  },
  mutations: {
    SAVE: (state, data) => { state.program = !data ? data : Object.assign({}, data); },
  },
  actions: {
    get: async ({ commit }, params) => {
      try {
        const program = await Programs.getById(params.programId);
        commit('SAVE', program);
      } catch (e) {
        console.error(e);
      }
    },
    remove: ({ commit }) => { commit('SAVE', null) },
  },
}
