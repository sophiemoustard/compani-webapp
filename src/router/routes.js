const routes = [
  { path: '/login', name: 'login', component: () => import('src/core/pages/signin/Authenticate') },
  { path: '/forgot-password', component: () => import('src/core/pages/signin/ForgotPassword'), name: 'forgotPassword' },
  { path: '/reset-password/:token', component: () => import('src/core/pages/signin/ResetPassword') },
  { path: '/403-pwd', component: () => import('src/core/pages/signin/403') },
  {
    path: '/display/:fileName',
    name: 'display file',
    component: () => import('src/core/pages/DisplayPdf'),
    props: route => ({ blobUrl: route.query.blobUrl, fileName: route.params.fileName }),
  },
  {
    path: '/docsigned',
    component: () => import('src/core/pages/DocumentSigned'),
    props: route => ({ signed: route.query.signed }),
  },
  {
    // Always leave this as last one
    path: '/:catchAll(.*)*',
    name: '404',
    component: () => import('src/core/pages/404'),
  },
];

export default routes;
