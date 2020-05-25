import Users from '@api/Users';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
import { taskValidation } from 'src/modules/client/helpers/taskValidation';

export const getUserProfile = async ({ commit }, params) => {
  try {
    const user = await Users.getById(params.userId);
    commit('saveUserProfile', user);
  } catch (e) {
    console.error(e);
  }
}

export const updateNotifications = async ({ commit, state }, type) => {
  const user = state.userProfile;
  const validation = userProfileValidation(user);
  commit('saveNotification', { type: 'profiles', _id: user._id, exists: !!validation.error });

  if (user.procedure) {
    const checkTasks = taskValidation(user);
    commit('saveNotification', { type: 'tasks', _id: user._id, exists: checkTasks });
  }
}

export const reset = ({ commit }) => {
  commit('saveNotification', null);
  commit('saveUserProfile', null);
}
