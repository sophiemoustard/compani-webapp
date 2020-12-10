import axios from 'axios';
import { Cookies } from 'quasar';
import qs from 'qs';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const instance = axios.create({
  withCredentials: true,
  paramsSerializer: params => qs.stringify(params, { indices: false }),
});

instance.interceptors.request.use(async (config) => {
  if (!Cookies.get('refresh_token')) {
    logOutAndRedirectToLogin();
    throw new Error('No refresh token');
  }

  return config;
}, err => Promise.reject(err));

instance.interceptors.response.use(response => response, error => Promise.reject(error.response));

export const alenviAxios = instance;
