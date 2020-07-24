import { Platform } from 'quasar';
import get from 'lodash/get';
import users from '@api/Users';
import { userModel } from '@data/user';
import { extend } from '@helpers/utils';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

export default {
  namespaced: true,
  state: {
    loggedUser: null,
    refreshState: true,
    drawer: !!Platform.is.desktop,
  },
  mutations: {
    SET_REFRESH_STATE: (state, refresh) => { state.refreshState = refresh },
    SET_DRAWER: (state, toggle) => { state.drawer = toggle },
    SET_LOGGED_USER: (state, user) => { state.loggedUser = user },
  },
  actions: {
    setRefreshState: ({ commit }, refresh) => { commit('SET_REFRESH_STATE', refresh) },
    setDrawer: ({ commit }, toggle) => { commit('SET_DRAWER', toggle) },
    fetchLoggedUser: async ({ commit }, userId) => {
      try {
        const user = await users.getById(userId);

        commit('SET_LOGGED_USER', Object.assign({}, extend(userModel, user)));
      } catch (e) {
        if (!e) return; // If the api does not respond anything
        console.error(e);
        commit('SET_LOGGED_USER', null);
        logOutAndRedirectToLogin();
      }
    },
    resetMain: ({ commit }) => {
      commit('SET_LOGGED_USER', null);
      commit('SET_REFRESH_STATE', true);
      commit('SET_DRAWER', !!Platform.is.desktop);
    },
  },
  getters: {
    getLoggedUser: (state) => state.loggedUser,
    getCompany: (state) => state.loggedUser.company,
    getClientRole: (state) => get(state, 'loggedUser.role.client.name'),
    getVendorRole: (state) => get(state, 'loggedUser.role.vendor.name'),
  },
};
