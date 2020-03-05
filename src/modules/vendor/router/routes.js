import { Cookies } from 'quasar';
import get from 'lodash/get';
import alenvi from '@helpers/alenvi';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';
import store from 'src/store/index';

const routes = [
  {
    path: '/ad/',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();
        const refresh = await alenvi.refreshAlenviCookies();
        if (refresh) await store.dispatch('main/getLoggedUser', Cookies.get('user_id'));

        const loggedUser = store.getters['main/loggedUser'];
        if (!loggedUser) return next({ path: '/login' });
        if (!get(loggedUser, 'role.vendor')) return next({ name: '404' });

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
          role: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/companies/:companyId',
        name: 'profile company info',
        component: () => import('src/modules/vendor/pages/ni/users/companies/CompanyProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/trainers',
        name: 'trainers directory',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'users',
        },
      },
      {
        path: 'ni/config/courses',
        name: 'courses directory',
        component: () => import('src/modules/vendor/pages/ni/config/CoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/courses/:courseId',
        name: 'profile course info',
        component: () => import('src/modules/vendor/pages/ni/config/CourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'configuration',
        },
      },
    ],
  },
];

export default routes;
