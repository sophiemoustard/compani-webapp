import axios from 'axios';
import { Cookies } from 'quasar';
import qs from 'qs';
import { refreshAlenviCookies } from '@helpers/alenvi';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const instance = axios.create({
  paramsSerializer: params => qs.stringify(params, { indices: false }),
});

instance.interceptors.request.use(async (config) => {
  if (!Cookies.get('refresh_token')) {
    logOutAndRedirectToLogin();
    throw new Error('No refresh token');
  }

  if (!Cookies.get('alenvi_token')) {
    const refresh = await refreshAlenviCookies();
    if (!refresh) {
      logOutAndRedirectToLogin();
      throw new Error('No alenvi token');
    }
  }

  // Headers for request only to API (alenvi)
  config.headers.common['x-access-token'] = Cookies.get('alenvi_token');
  return config;
}, err => Promise.reject(err));

instance.interceptors.response.use(response => response, error => Promise.reject(error.response));

export const alenviAxios = instance;
