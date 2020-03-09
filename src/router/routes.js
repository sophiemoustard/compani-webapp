
import { Cookies } from 'quasar';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('src/core/pages/signin/Authenticate'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('refresh_token')) return next({ path: '/' });
      return next();
    },
  },
  {
    path: '/enterCode',
    component: () => import('src/core/pages/signup/EnterCode'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('refresh_token')) return next({ path: '/' });
      return next();
    },
  },
  { path: '/forgotPassword', component: () => import('src/core/pages/signin/ForgotPwd') },
  { path: '/resetPassword/:token', component: () => import('src/core/pages/signin/ResetPwd') },
  {
    path: '/createPassword',
    component: () => import('src/core/pages/signup/CreatePassword'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('signup_token') && Cookies.get('signup_userId') && Cookies.get('signup_userEmail')) {
        next();
      } else {
        next({ path: '/enterCode' });
      }
    },
  },
  { path: '/403-pwd', component: () => import('src/core/pages/signin/403') },
  { path: '/docsigned', component: () => import('src/core/pages/DocumentSigned'), props: route => ({ signed: route.query.signed }) },
  {
    // Always leave this as last one
    path: '*',
    name: '404',
    component: () => import('src/core/pages/404'),
  },
];

export default routes;
