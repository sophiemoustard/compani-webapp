import { LocalStorage } from 'quasar';
import router from 'src/router/index';
import store from 'src/store/index';
import Authentication from 'src/core/api/Authentication';

export const logOutAndRedirectToLogin = async (params) => {
  await Authentication.logOut();
  LocalStorage.clear();

  store.dispatch('course/resetCourse');
  store.dispatch('program/resetProgram');
  store.dispatch('company/resetCompany');
  store.dispatch('userProfile/resetUserProfile');

  if (router.currentRoute.value.path === '/login') return;
  if (params && params.to) return router.replace({ path: '/login', query: { from: params.to.fullPath } });
  return router.replace('/login');
};
