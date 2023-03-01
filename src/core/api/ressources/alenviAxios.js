import axios from 'axios';
import qs from 'qs';
import { refreshAlenviCookies } from '@helpers/alenvi';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const instance = axios.create({
  withCredentials: true,
  paramsSerializer: { serialize: params => qs.stringify(params, { indices: false }) },
});

instance.interceptors.request.use(async config => config, err => Promise.reject(err));

instance.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response.status === 401) {
      const refresh = await refreshAlenviCookies();

      if (refresh) return axios.request(error.config);
      return logOutAndRedirectToLogin();
    }
    return Promise.reject(error.response);
  }
);

export const alenviAxios = instance;
