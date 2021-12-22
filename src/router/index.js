import { createRouter, createWebHistory } from 'vue-router';
// import VueMeta from 'vue-meta';
import pick from 'lodash/pick';
import { refreshState } from '@helpers/alenvi';
import { defineAbilitiesFor } from '@helpers/ability';
import routes from 'src/router/routes';
import { logOutAndRedirectToLogin } from 'src/router/redirect';
import clientRoutes from 'src/modules/client/router/routes';
import vendorRoutes from 'src/modules/vendor/router/routes';

// Vue.use(VueMeta);

export default ({ store }) => {
  const Router = createRouter({
    scrollBehavior: () => ({ top: 0 }),
    // routes needs to be at the end of array cf. /src/router/routes.js
    routes: [...clientRoutes, ...vendorRoutes, ...routes],
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    if (to.meta.cookies) {
      let loggedUser = store.getters['main/getLoggedUser'];
      if (!loggedUser) {
        const refresh = await refreshState();
        if (!refresh) return logOutAndRedirectToLogin({ to });

        loggedUser = store.getters['main/getLoggedUser'];
      }

      const ability = defineAbilitiesFor(pick(loggedUser, ['role', 'company']));
      if (!ability.can('read', to.name)) next('/404');
      else next();
    } else next();
  });

  return Router;
};
