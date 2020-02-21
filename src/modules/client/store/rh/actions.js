import users from '@api/Users';
import customers from '@api/Customers';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
import { customerProfileValidation } from 'src/modules/client/helpers/customerProfileValidation';
import { taskValidation } from 'src/modules/client/helpers/taskValidation';

export async function getUserProfile ({commit}, params) {
  try {
    const user = params.userId
      ? await users.getById(params.userId)
      : await customers.getById(params.customerId);
    commit('saveUserProfile', user);
  } catch (e) {
    console.error(e);
  }
}

export async function updateNotifications ({commit, state}, type) {
  const user = state.userProfile;
  let validation;
  if (type === 'user') {
    validation = userProfileValidation(user);
  } else if (type === 'customer') {
    validation = customerProfileValidation(user);
  }
  commit('saveNotification', {
    type: 'profiles',
    _id: user._id,
    exists: !!validation.error,
  });
  if (user.procedure) {
    const checkTasks = taskValidation(user);
    commit('saveNotification', {
      type: 'tasks',
      _id: user._id,
      exists: checkTasks,
    });
  }
}
