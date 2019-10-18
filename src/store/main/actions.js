import users from '../../api/Users';
import redirect from '../../router/redirect';

export const getUser = async ({ commit }, userId) => {
  try {
    const user = await users.getById(userId);
    commit('setUser', user);
  } catch (e) {
    console.error(e);
    if (e.status === 401) {
      redirect.redirectToLogin();
    }
  }
};
