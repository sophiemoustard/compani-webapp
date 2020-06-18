import { Cookies } from 'quasar';
import User from '@api/Users';

export default {
  async refreshAlenviCookies () {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        const newToken = await User.refreshToken({ refreshToken });
        const expiresInDays = parseInt(newToken.expiresIn / 3600 / 24, 10) >= 1
          ? parseInt(newToken.expiresIn / 3600 / 24, 10)
          : 1;
        const options = {
          path: '/',
          expires: expiresInDays,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'Strict',
        };
        Cookies.set('alenvi_token', newToken.token, options);
        Cookies.set('alenvi_token_expires_in', newToken.expiresIn, options);
        Cookies.set('user_id', newToken.user._id, options);

        return true;
      }

      Cookies.remove('alenvi_token', { path: '/' });
      Cookies.remove('user_id', { path: '/' });
      Cookies.remove('alenvi_token_expires_in', { path: '/' });

      return false;
    } catch (e) {
      console.error(e.response.message);
      if (e.response.status === 404) {
        Cookies.remove('alenvi_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        Cookies.remove('user_id', { path: '/' });
        Cookies.remove('alenvi_token_expires_in', { path: '/' });
      }

      return false;
    }
  },
};
