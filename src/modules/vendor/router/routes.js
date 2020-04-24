import { Cookies } from 'quasar';
import alenvi from '@helpers/alenvi';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, TRAINER } from '@data/constants';
import store from 'src/store/index';

const routes = [
  {
    path: '/ad',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (!['/ad', '/ad/'].includes(to.path)) return next();

        const refresh = await alenvi.refreshAlenviCookies();
        if (refresh) await store.dispatch('main/getLoggedUser', Cookies.get('user_id'));

        const loggedUser = store.state.main.loggedUser;
        if (!loggedUser) return next({ path: '/login' });

        const userVendorRole = store.getters['main/vendorRole'];
        if (!userVendorRole) return next({ name: '404' });

        if (userVendorRole === TRAINER) return next({ name: 'trainer courses directory' });
        return next({ name: 'courses directory' });
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
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
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
        path: 'ni/users/trainers/:trainerId',
        name: 'profile trainer info',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainerProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'users',
        },
      },
      {
        path: 'ni/config/programs',
        name: 'programs directory',
        component: () => import('src/modules/vendor/pages/ni/config/ProgramsDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/programs/:programId',
        name: 'profile program info',
        component: () => import('src/modules/vendor/pages/ni/config/ProgramProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/management/courses',
        name: 'courses directory',
        component: () => import('src/modules/vendor/pages/ni/management/CoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'management',
        },
      },
      {
        path: 'ni/management/courses/:courseId',
        name: 'profile course info',
        component: () => import('src/modules/vendor/pages/ni/management/CourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER],
          parent: 'configuration',
        },
      },
      {
        path: 'trainers/management/courses',
        name: 'trainer courses directory',
        component: () => import('src/modules/vendor/pages/ni/management/CoursesDirectory'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [TRAINER],
          parent: 'configuration',
        },
      },
      {
        path: 'trainers/management/courses/:courseId',
        name: 'trainer course info',
        component: () => import('src/modules/vendor/pages/ni/management/CourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [TRAINER],
          parent: 'configuration',
        },
      },
      {
        path: 'trainers/info',
        name: 'trainer personal info',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainerProfile'),
        props: true,
        beforeEnter (to, from, next) {
          return to.params.trainerId === Cookies.get('user_id') ? next() : next('/404');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [TRAINER],
          parent: 'administrative',
        },
      },
      {
        path: ':id/account',
        name: 'vendor account info',
        component: () => import('src/core/pages/AccountInfo'),
        beforeEnter (to, from, next) {
          return to.params.id === Cookies.get('user_id') ? next() : next('/404');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, TRAINER],
        },
      },
    ],
  },
];

export default routes;
