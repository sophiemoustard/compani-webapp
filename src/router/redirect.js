import router from 'src/router/index';
import store from 'src/store/index';
import { Cookies, LocalStorage } from 'quasar';

export const logOutAndRedirectToLogin = (params) => {
  const options = { path: '/' };
  Cookies.remove('refresh_token', options);
  Cookies.remove('user_id', options);
  LocalStorage.clear();

  store.dispatch('course/resetCourse');
  store.dispatch('program/resetProgram');
  store.dispatch('company/resetCompany');
  store.dispatch('customer/resetCustomer');
  store.dispatch('userProfile/resetUserProfile');
  store.dispatch('planning/resetPlanning');

  if (router.currentRoute.path === '/login') return;
  if (params && params.to) return router.replace({ path: '/login', query: { from: params.to.fullPath } });
  return router.replace('/login');
};
