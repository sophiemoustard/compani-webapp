import { Cookies } from 'quasar';
import User from '@api/Users';
import store from 'src/store/index';
import { TOKEN_EXPIRE_TIME } from '@data/constants';

export const canNavigate = async () => {
  const { loggedUser } = store.state.main;
  if (!loggedUser && !Cookies.get('user_id') && !Cookies.get('refresh_token')) return false;

  if (!loggedUser && !Cookies.get('user_id')) {
    const refresh = await refreshAlenviCookies(); // refresh Cookies.get('user_id')
    if (!refresh) return false;
  }

  if (!loggedUser) await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

  return true;
};

export const refreshAlenviCookies = async () => {
  try {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      const newToken = await User.refreshToken({ refreshToken });
      const options = { path: '/', secure: process.env.NODE_ENV !== 'development', sameSite: 'Strict' };
      Cookies.set('alenvi_token', newToken.token, { ...options, expires: TOKEN_EXPIRE_TIME });
      Cookies.set('refresh_token', newToken.refreshToken, { ...options, expires: 365 });
      Cookies.set('user_id', newToken.user._id, { ...options, expires: TOKEN_EXPIRE_TIME });

      return true;
    }
    const options = { path: '/', sameSite: 'Strict' };
    Cookies.remove('alenvi_token', options);
    Cookies.remove('user_id', options);

    return false;
  } catch (e) {
    console.error(e);
    if (e.response.status === 404) {
      const options = { path: '/', sameSite: 'Strict' };
      Cookies.remove('alenvi_token', options);
      Cookies.remove('refresh_token', options);
      Cookies.remove('user_id', options);
    }

    return false;
  }
};
