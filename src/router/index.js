import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import { Cookies } from 'quasar';
import clientRoutes from 'src/modules/client/router/routes';
import vendorRoutes from 'src/modules/vendor/router/routes';
import routes from 'src/router/routes';
import alenvi from '@helpers/alenvi';
import store from 'src/store/index';
import { defineAbilitiesFor } from '@helpers/ability';

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
        if (store.state.main.refreshState) await store.dispatch('main/getLoggedUser', Cookies.get('user_id'));

        const ability = defineAbilitiesFor({
          clientRole: store.getters['main/clientRole'],
          vendorRole: store.getters['main/vendorRole'],
          company: store.getters['main/company'],
        });
        if (!ability.can('read', to.name)) next('/404');
        else {
          store.dispatch('main/updateRefreshState', false);
          next();
        }
      } else next({ path: '/login', query: { from: to.fullPath } });
    } else {
      if (store.state.main.refreshState) await store.dispatch('main/getLoggedUser', Cookies.get('user_id'));

      const ability = defineAbilitiesFor({
        clientRole: store.getters['main/clientRole'],
        vendorRole: store.getters['main/vendorRole'],
        company: store.getters['main/company'],
      });
      if (!ability.can('read', to.name)) next('/404');
      else {
        store.dispatch('main/updateRefreshState', false);
        next();
      }
    }
  } else next();
});

export default Router;
