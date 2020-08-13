import Programs from '@api/Programs';
import Activities from '@api/Activities';

export default {
  namespaced: true,
  state: {
    program: null,
    activity: null,
    card: null,
  },
  mutations: {
    SET_PROGRAM: (state, data) => { state.program = !data ? data : Object.assign({}, data); },
    SET_ACTIVITY: (state, data) => { state.activity = !data ? data : Object.assign({}, data); },
    SET_CARD: (state, data) => { state.card = !data ? data : Object.assign({}, data); },
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
    resetProgram: ({ commit }) => { commit('SET_PROGRAM', null); },
    fetchActivity: async ({ commit }, params) => {
      try {
        const activity = await Activities.getById(params.activityId);
        commit('SET_ACTIVITY', activity);
      } catch (e) {
        console.error(e);
      }
    },
    resetActivity: ({ commit }) => { commit('SET_ACTIVITY', null); },
    fetchCard: ({ commit }, card) => { commit('SET_CARD', card); },
    resetCard: ({ commit }) => { commit('SET_CARD', null); },
  },
  getters: {
    getCards: state => state.activity ? state.activity.cards : [],
  },
};
