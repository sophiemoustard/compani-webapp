import Users from '@api/Users';
import { userModel } from '@data/user';
import { extend } from '@helpers/utils';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';

export default {
  namespaced: true,
  state: {
    userProfile: null,
    notifications: {
      profiles: {},
    },
  },
  mutations: {
    SET_USER_PROFILE: (state, data) => { state.userProfile = !data ? data : Object.assign({}, data); },
    SET_NOTIFICATION: (state, notification) => {
      if (!notification) {
        state.notifications = {}
        return;
      }
      state.notifications[notification.type] = Object.assign({}, state.notifications[notification.type], {
        [notification._id]: notification.exists,
      });
    },
  },
  actions: {
    fetchUserProfile: async ({ commit }, params) => {
      try {
        const user = await Users.getById(params.userId);

        commit('SET_USER_PROFILE', Object.assign({}, extend(userModel, user)));
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
    resetRh: ({ commit }) => {
      commit('SET_NOTIFICATION', null);
      commit('SET_USER_PROFILE', null);
    },
  },
  getters: {
    getUserProfile: (state) => state.userProfile,
  },
}
