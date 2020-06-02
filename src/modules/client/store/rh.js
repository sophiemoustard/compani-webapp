import Users from '@api/Users';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
import { taskValidation } from 'src/modules/client/helpers/taskValidation';

export default {
  namespaced: true,
  state: {
    userProfile: null,
    notifications: {
      profiles: {},
      tasks: {},
    },
  },
  mutations: {
    SET_USERPROFILE: (state, data) => { state.userProfile = !data ? data : Object.assign({}, data); },
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
    getUserProfile: async ({ commit }, params) => {
      try {
        const user = await Users.getById(params.userId);
        commit('SET_USERPROFILE', user);
      } catch (e) {
        console.error(e);
      }
    },
    setUserProfile: ({ commit }, data) => commit('SET_USERPROFILE', data),
    resetUserProfile: ({ commit }) => commit('SET_USERPROFILE', null),
    updateNotifications: async ({ commit, state }) => {
      const user = state.userProfile;
      const validation = userProfileValidation(user);
      commit('SET_NOTIFICATION', { type: 'profiles', _id: user._id, exists: !!validation.error });

      if (user.procedure) {
        const checkTasks = taskValidation(user);
        commit('SET_NOTIFICATION', { type: 'tasks', _id: user._id, exists: checkTasks });
      }
    },
    setNotification: ({ commit }, data) => commit('SET_NOTIFICATION', data),
    resetAll: ({ commit }) => {
      commit('SET_NOTIFICATION', null);
      commit('SET_USERPROFILE', null);
    },
  },
}
