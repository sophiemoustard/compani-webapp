
const routes = [
  { path: '/login', name: 'login', component: () => import('src/core/pages/signin/Authenticate') },
  { path: '/forgot-password', component: () => import('src/core/pages/signin/ForgotPassword'), name: 'forgotPassword' },
  { path: '/reset-password/:token', component: () => import('src/core/pages/signin/ResetPassword') },
  { path: '/403-pwd', component: () => import('src/core/pages/signin/403') },
  {
    path: '/docsigned',
    component: () => import('src/core/pages/DocumentSigned'),
    props: route => ({ signed: route.query.signed }),
  },
  { path: '/trainees/courses/:courseId', component: () => import('src/core/pages/courses/CourseInfo') },
  {
    // Always leave this as last one
    path: '*',
    name: '404',
    component: () => import('src/core/pages/404'),
  },
];

export default routes;
