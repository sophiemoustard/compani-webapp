import { Cookies } from 'quasar';
import get from 'lodash/get';
import alenvi from '@helpers/alenvi';
import store from 'src/store/index';

const routes = [
  {
    path: '/ad/',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();
        const refresh = await alenvi.refreshAlenviCookies();
        if (refresh) await store.dispatch('main/getUser', Cookies.get('user_id'));

        const user = store.getters['main/user'];
        if (!user) return next({ path: '/login' });
        if (!get(user, 'role.vendor')) return next({ name: '404' });

        return next();
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ni/users/companies',
        name: 'companies directory',
        component: () => import('src/modules/vendor/pages/ni/users/companies/CompaniesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'ni/users/trainers',
        name: 'trainers directory',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'ni/config/courses',
        name: 'courses directory',
        component: () => import('src/modules/vendor/pages/ni/config/CoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
    ],
  },
];

export default routes;
