
import { Cookies } from 'quasar';

import store from '../store/index';
import alenvi from '../helpers/alenvi';
import { AUXILIARY, PLANNING_REFERENT, HELPER } from '../data/constants.js';

const routes = [
  {
    path: '/',
    components: { default: () => import('layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        console.log('to', to)
        if (to.path !== '/') return next();
        if (await alenvi.refreshAlenviCookies()) {
          await store.dispatch('main/getUser', Cookies.get('user_id'));
        }
        if (store.getters['main/user'] && store.getters['main/user'].role.name === HELPER) {
          // return next({name: 'customer agenda'});
          return next({ name: 'account info', params: { id: store.getters['main/user']._id } }); // TODO : a changer
        } else if (
          store.getters['main/user'] &&
          (store.getters['main/user'].role.name === AUXILIARY ||
            store.getters['main/user'].role.name === PLANNING_REFERENT)
        ) {
          // return next({name: 'auxiliary agenda'});
          return next({ name: 'account info', params: { id: store.getters['main/user']._id } }); // TODO : a changer
        } else if (
          store.getters['main/user'] &&
          store.getters['main/user'].role.name !== AUXILIARY &&
          store.getters['main/user'].role.name !== HELPER
        ) {
          // return next({ name: 'administrative directory' });
          return next({ name: 'account info', params: { id: store.getters['main/user']._id } }); // TODO : a changer
        } else {
          next({ path: '/login' });
        }
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      // {
      //   path: 'ni/config/rh',
      //   name: 'rh config',
      //   component: () => import('pages/ni/config/RhConfig'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'config:edit',
      //     parent: 'configuration',
      //   },
      // },
      // {
      //   path: 'ni/config/customers',
      //   name: 'customers config',
      //   component: () => import('pages/ni/config/CustomersConfig'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'config:edit',
      //     parent: 'configuration',
      //   },
      // },
      {
        path: 'ni/config/tags',
        name: 'tags config',
        component: () => import('pages/ni/config/TagConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: 'config:edit',
          parent: 'configuration',
        },
      },
      // {
      //   path: 'ni/billing/to-bill',
      //   name: 'to bill',
      //   component: () => import('pages/ni/billing/ToBill'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'bills:edit',
      //     parent: 'billing',
      //   },
      // },
      // {
      //   path: 'ni/billing/credit-notes',
      //   name: 'credit note',
      //   component: () => import('pages/ni/billing/CreditNotes'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'bills:edit',
      //     parent: 'billing',
      //   },
      // },
      // {
      //   path: 'ni/billing/clients-balances',
      //   name: 'clients balances',
      //   component: () => import('pages/ni/billing/ClientsBalances'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'bills:edit',
      //     parent: 'billing',
      //   },
      // },
      // {
      //   path: 'ni/billing/debits-archive',
      //   name: 'debits archive',
      //   component: () => import('pages/ni/billing/DebitsArchive'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'bills:edit',
      //     parent: 'billing',
      //   },
      // },
      {
        path: 'ni/pay/to-pay',
        name: 'to pay',
        component: () => import('pages/ni/pay/ToPay'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          permissions: 'pay:edit',
          parent: 'pay',
        },
      },
      // {
      //   path: 'ni/pay/contract-ends',
      //   name: 'contract ends',
      //   component: () => import('pages/ni/pay/ContractEnds'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'pay:edit',
      //     parent: 'pay',
      //   },
      // },
      // {
      //   path: 'ni/pay/contract-monitoring',
      //   name: 'contract monitoring',
      //   component: () => import('pages/ni/pay/ContractMonitoring'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'contracts:edit',
      //     parent: 'pay',
      //   },
      // },
      // {
      //   path: 'ni/pay/absences',
      //   name: 'absences',
      //   component: () => import('pages/ni/pay/Absences'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'pay:edit',
      //     parent: 'pay',
      //   },
      // },
      // {
      //   path: 'ni/exports/data',
      //   name: 'data',
      //   component: () => import('pages/ni/exports/DataExports'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'exports:read',
      //     parent: 'exports',
      //   },
      // },
      // {
      //   path: 'ni/exports/history',
      //   name: 'history',
      //   component: () => import('pages/ni/exports/HistoryExports'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'exports:read',
      //     parent: 'exports',
      //   },
      // },
      // {
      //   path: 'ni/auxiliaries',
      //   name: 'administrative directory',
      //   component: () => import('pages/ni/auxiliaries/Directory'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:edit',
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'ni/auxiliaries/staff-register',
      //   name: 'staff register',
      //   component: () => import('pages/ni/auxiliaries/StaffRegister'),
      //   props: true,
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'contracts:edit',
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'ni/auxiliaries/:id',
      //   name: 'personal info',
      //   component: () => import('pages/ni/auxiliaries/PersonalInfo'),
      //   props: true,
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:edit',
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'ni/customers',
      //   name: 'customers directory',
      //   component: () => import('pages/ni/customers/CustomersDirectory'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:edit',
      //     parent: 'benef',
      //   },
      // },
      // {
      //   path: 'ni/customers/:id',
      //   name: 'customers profile',
      //   props: true,
      //   component: () => import('pages/ni/customers/Profile'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:edit',
      //     parent: 'benef',
      //   },
      // },
      // {
      //   path: 'ni/planning/auxiliaries',
      //   name: 'auxiliaries planning',
      //   component: () => import('pages/ni/planning/AuxiliaryPlanning'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'events:read',
      //   },
      // },
      // {
      //   path: 'ni/planning/customers',
      //   name: 'customers planning',
      //   component: () => import('pages/ni/planning/CustomerPlanning'),
      //   props: true,
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'events:read',
      //   },
      // },
      // // Auxiliary view routes
      // {
      //   path: 'auxiliaries/agenda',
      //   name: 'auxiliary agenda',
      //   component: () => import('pages/auxiliaries/planning/AuxiliaryAgenda'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'events:read',
      //   },
      // },
      // {
      //   path: 'auxiliaries/team',
      //   name: 'team directory',
      //   component: () => import('pages/auxiliaries/team/TeamDirectory'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:list',
      //     parent: 'team',
      //   },
      // },
      // {
      //   path: 'auxiliaries/customers',
      //   name: 'profile customers',
      //   component: () => import('pages/auxiliaries/customers/AuxiliaryCustomersDirectory'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:list',
      //     parent: 'benef',
      //   },
      // },
      // {
      //   path: 'auxiliaries/customers/:customerId',
      //   name: 'profile customers info',
      //   props: true,
      //   component: () => import('pages/auxiliaries/customers/CustomerInfo'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:list',
      //   },
      // },
      // {
      //   path: 'auxiliaries/pay',
      //   name: 'profile salaries',
      //   component: () => import('pages/auxiliaries/administrative/Salaries'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'pay:read',
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'auxiliaries/docs',
      //   name: 'profile docs',
      //   component: () => import('pages/auxiliaries/administrative/Documents'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'auxiliaries/contracts',
      //   name: 'profile contracts',
      //   component: () => import('pages/auxiliaries/administrative/Contracts'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     parent: 'administrative',
      //   },
      // },
      // {
      //   path: 'auxiliaries/info',
      //   name: 'auxiliary personal info',
      //   component: () => import('pages/auxiliaries/administrative/Info'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //     permissions: 'users:list',
      //     parent: 'administrative',
      //   },
      // },
      // // Customers view routes
      // {
      //   path: 'customers/agenda',
      //   name: 'customer agenda',
      //   component: () => import('pages/customers/CustomerAgenda'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //   },
      // },
      {
        path: 'customers/documents',
        name: 'customer documents',
        component: () => import('pages/customers/Billing'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      // {
      //   path: 'customers/subscriptions',
      //   name: 'customer subscription',
      //   component: () => import('pages/customers/Subscriptions'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //   },
      // },
      // {
      //   path: 'customers/contracts',
      //   name: 'customer contracts',
      //   component: () => import('pages/customers/Contracts'),
      //   meta: {
      //     cookies: ['alenvi_token', 'refresh_token'],
      //   },
      // },
      // All profiles
      {
        path: ':id/account',
        name: 'account info',
        component: () => import('pages/AccountInfo'),
        beforeEnter (to, from, next) {
          return to.params.id === Cookies.get('user_id') ? next() : next('/401');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/signin/Authenticate'),
    beforeEnter: (to, from, next) => {
      if (Cookies.get('refresh_token')) return next({path: '/'});
      return next();
    },
  },
  // { path: '/enterCode', component: () => import('pages/signup/EnterCode') },
  // { path: '/messenger', component: () => import('pages/signup/ChooseMessengerPlatform') },
  // {
  //   path: '/createPassword',
  //   component: () => import('pages/signup/CreatePassword'),
  //   beforeEnter: (to, from, next) => {
  //     if (Cookies.get('signup_token') && Cookies.get('signup_userId') && Cookies.get('signup_userEmail')) {
  //       next();
  //     } else {
  //       next({ path: '/enterCode' });
  //     }
  //   },
  // },
  // { path: '/forgotPassword', component: () => import('pages/signin/ForgotPwd') },
  // { path: '/resetPassword/:token', component: () => import('pages/signin/ResetPwd') },
  // { path: '/error403Pwd', component: () => import('pages/signin/403') },
  { path: '/401', component: () => import('pages/401') },
  // { path: '/docsigned', component: () => import('pages/DocumentSigned'), props: route => ({signed: route.query.signed}) },
  // {
  //   path: '/display/:fileName',
  //   name: 'display file',
  //   component: () => import('pages/DisplayPdf'),
  //   props: (route) => ({ blobUrl: route.query.blobUrl, fileName: route.params.fileName }),
  // },
  {
    // Always leave this as last one
    path: '*',
    component: () => import('pages/404'),
  },
];

export default routes;
