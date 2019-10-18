import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import { Cookies } from 'quasar'

import routes from './routes'
import alenvi from '../helpers/alenvi'
import store from '../store/index'
import { checkPermission } from '../helpers/checkPermission'

Vue.use(VueRouter)
Vue.use(VueMeta);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const Router = new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes,

  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
})

Router.beforeEach(async (to, from, next) => {
  if (to.meta.cookies) {
    if (!Cookies.get('alenvi_token') || !Cookies.get('user_id')) {
      if (await alenvi.refreshAlenviCookies()) {
        if (store.state.main.refreshState) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (checkPermission(to, store.getters['main/user'])) {
          store.commit('main/changeRefreshState', false);
          next();
        } else {
          next('/401');
        }
      } else {
        next({ path: '/login', query: { from: to.fullPath } });
      }
    } else {
      if (store.state.main.refreshState) {
        await store.dispatch('main/getUser', Cookies.get('user_id'));
      }
      if (checkPermission(to, store.getters['main/user'])) {
        store.commit('main/changeRefreshState', false);
        next();
      } else {
        next('/401');
      }
    }
  } else {
    next();
  }
});

export default Router;
