import { Cookies } from 'quasar';
import Authentication from '@api/Authentication';
import store from 'src/store/index';

export const canNavigate = async () => {
  const { loggedUser } = store.state.main;
  if (!loggedUser && !Cookies.get('user_id')) await refreshAlenviCookies();
  if (!loggedUser) await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

  return true;
};

export const refreshAlenviCookies = async () => {
  try {
    await Authentication.refreshToken();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const isUserLogged = async () => {
  const refresh = await refreshAlenviCookies();
  if (!refresh) return false;

  await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));
  const loggedUser = store.getters['main/getLoggedUser'];
  if (loggedUser) return true;

  await Authentication.logOut();
  return false;
};
