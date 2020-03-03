import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import { Cookies } from 'quasar';
import clientRoutes from 'src/modules/client/router/routes';
import vendorRoutes from 'src/modules/vendor/router/routes';
import routes from 'src/router/routes';
import alenvi from '@helpers/alenvi';
import store from 'src/store/index';
import { checkRole } from '@helpers/role';

Vue.use(VueRouter)
Vue.use(VueMeta);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const Router = new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes: [...routes, ...vendorRoutes, ...clientRoutes],

  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
})

Router.beforeEach(async (to, from, next) => {
  if (to.meta.cookies) {
    if (!Cookies.get('alenvi_token') || !Cookies.get('user_id')) {
      const refresh = await alenvi.refreshAlenviCookies();
      if (refresh) {
        if (store.state.main.refreshState) await store.dispatch('current/getUser', Cookies.get('user_id'));

        const permission = checkRole(to, store.getters['current/user']);
        if (!permission) next('/404');
        else {
          store.commit('main/changeRefreshState', false);
          next();
        }
      } else next({ path: '/login', query: { from: to.fullPath } });
    } else {
      if (store.state.main.refreshState) await store.dispatch('current/getUser', Cookies.get('user_id'));

      const permission = checkRole(to, store.getters['current/user']);
      if (!permission) next('/404');
      else {
        store.commit('main/changeRefreshState', false);
        next();
      }
    }
  } else next();
});

export default Router;
