import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import { Cookies } from 'quasar';
import pick from 'lodash/pick';
import alenvi from '@helpers/alenvi';
import { defineAbilitiesFor } from '@helpers/ability';
import routes from 'src/router/routes';
import { logOutAndRedirectToLogin } from 'src/router/redirect';
import store from 'src/store/index';
import clientRoutes from 'src/modules/client/router/routes';
import vendorRoutes from 'src/modules/vendor/router/routes';

Vue.use(VueRouter)
Vue.use(VueMeta);

const Router = new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes: [...clientRoutes, ...vendorRoutes, ...routes], // routes needs to be at the end of array cf. /src/router/routes.js
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
})

Router.beforeEach(async (to, from, next) => {
  if (to.meta.cookies) {
    if (!Cookies.get('alenvi_token') || !Cookies.get('user_id')) {
      const refresh = await alenvi.refreshAlenviCookies();
      if (refresh) {
        if (store.state.main.refreshState) await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

        const loggedUser = store.getters['main/getLoggedUser'];
        if (!loggedUser) return logOutAndRedirectToLogin({ to });

        const ability = defineAbilitiesFor(pick(loggedUser, ['role', 'company']));
        if (!ability.can('read', to.name)) next('/404');
        else {
          store.dispatch('main/setRefreshState', false);
          next();
        }
      } else return logOutAndRedirectToLogin({ to });
    } else {
      if (store.state.main.refreshState) await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));

      const loggedUser = store.getters['main/getLoggedUser'];
      if (!loggedUser) return logOutAndRedirectToLogin({ to });

      const ability = defineAbilitiesFor(pick(loggedUser, ['role', 'company']));
      if (!ability.can('read', to.name)) next('/404');
      else {
        store.dispatch('main/setRefreshState', false);
        next();
      }
    }
  } else {
    if (['/login', '/forgot-password'].includes(to.path) && Cookies.get('refresh_token') && Cookies.get('user_id')) {
      await store.dispatch('main/fetchLoggedUser', Cookies.get('user_id'));
      const loggedUser = store.getters['main/getLoggedUser'];
      if (loggedUser) next({ path: '/' });
    }
    next();
  }
});

export default Router;
