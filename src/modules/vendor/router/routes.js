import { Cookies } from 'quasar';
import alenvi from '@helpers/alenvi';
import store from 'src/store/index';

const routes = [
  {
    path: '/',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();
        if (await alenvi.refreshAlenviCookies()) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        const user = store.getters['main/user'];
        if (!user) return next({ path: '/login' });
        return next();
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ad/config/company',
        name: 'company config',
        component: () => import('src/modules/client/pages/ni/config/CompanyConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
    ],
  },
];

export default routes;
