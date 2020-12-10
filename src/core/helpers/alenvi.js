import { Cookies } from 'quasar';
import User from '@api/Users';
import store from 'src/store/index';

export const canNavigate = async () => {
  const { loggedUser } = store.state.main;
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
    return false;
  }
};
