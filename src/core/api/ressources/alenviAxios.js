import axios from 'axios';
import qs from 'qs';

const instance = axios.create({
  withCredentials: true,
  paramsSerializer: params => qs.stringify(params, { indices: false }),
});

instance.interceptors.request.use(async config => config, err => Promise.reject(err));

instance.interceptors.response.use(response => response, error => Promise.reject(error.response));

export const alenviAxios = instance;
