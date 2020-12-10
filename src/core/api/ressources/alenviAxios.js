import axios from 'axios';
import qs from 'qs';
import { refreshAlenviCookies } from '../../helpers/alenvi';

const instance = axios.create({
  withCredentials: true,
  paramsSerializer: params => qs.stringify(params, { indices: false }),
});

instance.interceptors.request.use(async config => config, err => Promise.reject(err));

instance.interceptors.response.use(
  response => response,
  async (error) => {
    console.log(error.response);
    if (error.response.status === 401) {
      await refreshAlenviCookies();
      return axios.request(error.config);
    }
    return Promise.reject(error.response);
  }
);

export const alenviAxios = instance;
