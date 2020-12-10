import { Cookies } from 'quasar';
import User from '@api/Users';
import store from 'src/store/index';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

export const canNavigate = async () => {
  const { loggedUser } = store.state.main;
  // eslint-disable-next-line no-console
  console.log('nbonjour');
  if (!loggedUser && !Cookies.get('user_id')) await refreshAlenviCookies();
  if (!loggedUser) await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

  return true;
};

export const refreshAlenviCookies = async () => {
  try {
    await User.refreshToken();
    return true;
  } catch (e) {
    console.error(e);
    const options = { path: '/' };
    Cookies.remove('refresh_token', options);
    Cookies.remove('user_id', options);
    logOutAndRedirectToLogin();
  }
};
