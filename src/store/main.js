import { Platform } from 'quasar';
import get from 'lodash/get';
import users from '@api/Users';
import redirect from 'src/router/redirect';

export default {
  namespaced: true,
  state: {
    loggedUser: null,
    refreshState: true,
    drawer: !!Platform.is.desktop,
  },
  mutations: {
    REFRESH_STATE: (state, refresh) => { state.refreshState = refresh },
    DRAWER: (state, toggle) => { state.drawer = toggle },
    LOGGED_USER: (state, user) => { state.loggedUser = user },
  },
  actions: {
    updateRefreshState: ({ commit }, refresh) => { commit('REFRESH_STATE', refresh) },
    setDrawer: ({ commit }, toggle) => { commit('DRAWER', toggle) },
    getLoggedUser: async ({ commit }, userId) => {
      try {
        const user = await users.getById(userId);
        commit('LOGGED_USER', user);
      } catch (e) {
        console.error(e);
        if (e.status === 401) redirect.redirectToLogin();
      }
    },
  },
  getters: {
    company: (state) => state.loggedUser.company,
    clientRole: (state) => get(state, 'loggedUser.role.client.name'),
    vendorRole: (state) => get(state, 'loggedUser.role.vendor.name'),
  },
};
