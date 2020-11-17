import { Cookies } from 'quasar';
import get from 'lodash/get';
import { TRAINER } from '@data/constants';
import { canNavigate } from '@helpers/alenvi';
import store from 'src/store/index';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const routes = [
  {
    path: '/ad',
    components: { default: () => import('src/modules/vendor/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (!['/ad', '/ad/'].includes(to.path)) return next();

        if (!(await canNavigate())) return logOutAndRedirectToLogin();

        const userVendorRole = store.getters['main/getVendorRole'];
        if (!userVendorRole) return next({ path: '/' });

        if (userVendorRole === TRAINER) return next({ name: 'trainers courses' });
        return next({ name: 'ni management blended courses' });
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
        path: 'ni/users/learners',
        name: 'ni users learners',
        component: () => import('src/modules/vendor/pages/ni/users/learners/LearnersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'users',
        },
      },
      {
        path: 'ni/users/learners/:learnerId',
        name: 'ni users learners info',
        component: () => import('src/modules/vendor/pages/ni/users/learners/LearnerProfile'),
        props: true,
        beforeEnter: async (to, from, next) => {
          try {
            if (from.name === 'ni management blended courses info') to.params.defaultTab = 'courses';

            return next();
          } catch (e) {
            console.error(e);
          }
        },
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
        beforeEnter: async (to, from, next) => {
          try {
            if (from.name === 'ni config activity info') to.params.defaultTab = 'content';

            return next();
          } catch (e) {
            console.error(e);
          }
        },
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/programs/:programId/subprogram/:subProgramId/step/:stepId/activity/:activityId',
        name: 'ni config activity info',
        component: () => import('src/modules/vendor/pages/ni/config/ActivityProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/management/blended-courses',
        name: 'ni management blended courses',
        component: () => import('src/modules/vendor/pages/ni/management/BlendedCoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'ni/management/blended-courses/:courseId',
        name: 'ni management blended courses info',
        component: () => import('src/core/pages/courses/BlendedCourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'ni/management/elearning-courses',
        name: 'ni management elearning courses',
        component: () => import('src/modules/vendor/pages/ni/management/ELearningCoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'ni/management/elearning-courses/:courseId',
        name: 'ni management elearning courses info',
        component: () => import('src/modules/vendor/pages/ni/management/ELearningCourseProfile.vue'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'trainers/management/courses',
        name: 'trainers courses',
        component: () => import('src/modules/vendor/pages/trainers/management/BlendedCoursesDirectory'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'management',
        },
      },
      {
        path: 'trainers/management/courses/:courseId',
        name: 'trainers courses info',
        component: () => import('src/core/pages/courses/BlendedCourseProfile'),
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
        component: () => import('src/modules/vendor/pages/trainers/administrative/Info'),
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
