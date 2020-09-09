import Programs from '@api/Programs';
import Activities from '@api/Activities';

export default {
  namespaced: true,
  state: {
    program: null,
    activity: null,
    card: null,
    openedStep: null,
  },
  mutations: {
    SET_PROGRAM: (state, data) => { state.program = !data ? data : ({ ...data }); },
    SET_ACTIVITY: (state, data) => { state.activity = !data ? data : ({ ...data }); },
    SET_CARD: (state, data) => { state.card = !data ? data : ({ ...data }); },
    SET_OPENED_STEP: (state, data) => { state.openedStep = data; },
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
    fetchOpenedStep: async ({ commit }, params) => {
      try {
        commit('SET_OPENED_STEP', params.stepId);
      } catch (e) {
        console.error(e);
      }
    },
    resetOpenedStep: ({ commit }) => { commit('SET_OPENED_STEP', null); },
  },
  getters: {
    getCards: state => (state.activity ? state.activity.cards : []),
  },
};
