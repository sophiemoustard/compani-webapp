import { Cookies } from 'quasar';
import get from 'lodash/get';
import { TRAINER } from '@data/constants';
import store from 'src/store/index';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const routes = [
  {
    path: '/ad',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (!['/ad', '/ad/'].includes(to.path)) return next();

        const loggedUser = store.state.main.loggedUser;
        const userId = Cookies.get('user_id');
        if (!loggedUser && !userId) return logOutAndRedirectToLogin();
        if (!loggedUser) await store.dispatch('main/fetchLoggedUser', userId);

        const userVendorRole = store.getters['main/getVendorRole'];
        if (!userVendorRole) return next({ path: '/' });

        if (userVendorRole === TRAINER) return next({ name: 'trainers courses' });
        return next({ name: 'ni management courses' });
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ni/users/companies',
        name: 'ni users companies',
        component: () => import('src/modules/vendor/pages/ni/users/companies/CompaniesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/companies/:companyId',
        name: 'ni users companies info',
        component: () => import('src/modules/vendor/pages/ni/users/companies/CompanyProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/trainers',
        name: 'ni users trainers',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/trainers/:trainerId',
        name: 'ni users trainers info',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainerProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'users',
        },
      },
      {
        path: 'ni/config/programs',
        name: 'ni config programs',
        component: () => import('src/modules/vendor/pages/ni/config/ProgramsDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/programs/:programId',
        name: 'ni config programs info',
        component: () => import('src/modules/vendor/pages/ni/config/ProgramProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/programs/:programId/step/:stepId/activity/:activityId',
        name: 'ni config activity info',
        component: () => import('src/modules/vendor/pages/ni/config/ActivityProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/management/courses',
        name: 'ni management courses',
        component: () => import('src/modules/vendor/pages/ni/management/CoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'ni/management/courses/:courseId',
        name: 'ni management courses info',
        component: () => import('src/core/pages/courses/CourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'trainers/management/courses',
        name: 'trainers courses',
        component: () => import('src/modules/vendor/pages/trainers/management/CoursesDirectory'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'trainers/management/courses/:courseId',
        name: 'trainers courses info',
        component: () => import('src/core/pages/courses/CourseProfile'),
        async beforeEnter (to, from, next) {
          await store.dispatch('course/fetchCourse', { courseId: to.params.courseId });
          const { course } = store.state.course;

          return Cookies.get('user_id') === get(course, 'trainer._id') ? next() : next('/404');
        },
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'trainers/info',
        name: 'trainers info',
        component: () => import('src/modules/vendor/pages/ni/users/trainers/TrainerProfile'),
        props: true,
        beforeEnter (to, from, next) {
          return to.params.trainerId === Cookies.get('user_id') ? next() : next('/404');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'administrative',
        },
      },
      {
        path: 'account',
        name: 'account vendor',
        component: () => import('src/core/pages/AccountInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
    ],
  },
];

export default routes;
