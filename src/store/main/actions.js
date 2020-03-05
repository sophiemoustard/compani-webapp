import users from '@api/Users';
import redirect from 'src/router/redirect';

export const getLoggedUser = async ({ commit }, userId) => {
  try {
    const user = await users.getById(userId);
    commit('setLoggedUser', user);
  } catch (e) {
    console.error(e);
    if (e.status === 401) {
      redirect.redirectToLogin();
    }
  }
};
