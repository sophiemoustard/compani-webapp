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
        Cookies.set('refresh_token', newToken.refreshToken, { ...options, expires: 365 });
        Cookies.set('alenvi_token_expires_in', newToken.expiresIn, options);
        Cookies.set('user_id', newToken.user._id, options);

        return true;
      }
      const options = { path: '/', sameSite: 'Strict' }
      Cookies.remove('alenvi_token', options);
      Cookies.remove('user_id', options);
      Cookies.remove('alenvi_token_expires_in', options);

      return false;
    } catch (e) {
      console.error(e.response.message);
      if (e.response.status === 404) {
        const options = { path: '/', sameSite: 'Strict' }
        Cookies.remove('alenvi_token', options);
        Cookies.remove('refresh_token', options);
        Cookies.remove('user_id', options);
        Cookies.remove('alenvi_token_expires_in', options);
      }

      return false;
    }
  },
};
