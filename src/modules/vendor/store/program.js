import Programs from '@api/Programs';

export default {
  namespaced: true,
  state: {
    program: null,
  },
  mutations: {
    SET_PROGRAM: (state, data) => { state.program = !data ? data : Object.assign({}, data); },
  },
  actions: {
    fetchProgram: async ({ commit }, params) => {
      try {
        const program = await Programs.getById(params.programId);
        commit('SET_PROGRAM', program);
      } catch (e) {
        console.error(e);
      }
    },
    resetProgram: ({ commit }) => { commit('SET_PROGRAM', null) },
  },
}
