import Users from '@api/Users';
import { userModel } from '@data/user';
import { extend } from '@helpers/utils';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
import store from 'src/store/index';
import router from 'src/router/index';
import { getCurrentAndFutureCompanies } from '@helpers/userCompanies';

export default {
  namespaced: true,
  state: {
    userProfile: null,
    notifications: {
      profiles: {},
    },
  },
  mutations: {
    SET_USER_PROFILE: (state, data) => { state.userProfile = data ? ({ ...data }) : data; },
    SET_NOTIFICATION: (state, notification) => {
      if (!notification) {
        state.notifications = {};
        return;
      }
      state.notifications[notification.type] = {
        ...state.notifications[notification.type],
        [notification._id]: notification.exists,
      };
    },
  },
  actions: {
    fetchUserProfile: async ({ commit }, params) => {
      try {
        const user = await Users.getById(params.userId);

        const userClientRole = store.getters['main/getClientRole'];
        if (userClientRole && !/\/ad\//.test(router.currentRoute.value.path)) {
          const loggedUserCompany = store.getters['main/getCompany'];
          const currentOrFutureCompanies = getCurrentAndFutureCompanies(user.userCompanyList);
          if (!currentOrFutureCompanies.includes(loggedUserCompany._id)) {
            return router.replace({ path: '/404' });
          }
        }

        commit('SET_USER_PROFILE', { ...extend(userModel, user) });
      } catch (e) {
        console.error(e);
      }
    },
    setUserProfile: ({ commit }, data) => commit('SET_USER_PROFILE', data),
    updateNotifications: async ({ commit, state }) => {
      const user = state.userProfile;
      const validation = userProfileValidation(user);
      commit('SET_NOTIFICATION', { type: 'profiles', _id: user._id, exists: !!validation.error });
    },
    setNotification: ({ commit }, data) => commit('SET_NOTIFICATION', data),
    resetUserProfile: ({ commit }) => {
      commit('SET_NOTIFICATION', null);
      commit('SET_USER_PROFILE', null);
    },
  },
  getters: {
    getUserProfile: state => state.userProfile,
  },
};
