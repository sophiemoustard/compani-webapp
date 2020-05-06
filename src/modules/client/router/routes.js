import { Cookies } from 'quasar';
import get from 'lodash/get';
import Customers from '@api/Customers';
import alenvi from '@helpers/alenvi';
import store from 'src/store/index';
import {
  HELPER,
  AUXILIARY_ROLES,
  COACH_ROLES,
  AUXILIARY_WITHOUT_COMPANY,
  CLIENT_ADMIN,
  COACH,
  PLANNING_REFERENT,
  AUXILIARY,
} from 'src/core/data/constants';

const routes = [
  {
    path: '/',
    components: { default: () => import('src/modules/client/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();
        const refresh = await alenvi.refreshAlenviCookies();
        if (refresh) await store.dispatch('main/getLoggedUser', Cookies.get('user_id'));

        const loggedUser = store.state.main.loggedUser;
        if (!loggedUser) return next({ path: '/login' });

        const userVendorRole = store.getters['main/vendorRole'];
        const userClientRole = store.getters['main/clientRole'];
        if (!userClientRole && !userVendorRole) return next({ name: '404' });
        if (!userClientRole) return next({ path: '/ad' });

        if (userClientRole === HELPER) return next({ name: 'customer agenda' });
        if (userClientRole === AUXILIARY_WITHOUT_COMPANY) return next({ name: 'client account info', params: { id: loggedUser._id } });
        if (AUXILIARY_ROLES.includes(userClientRole)) return next({ name: 'auxiliary agenda' });
        if (COACH_ROLES.includes(userClientRole)) return next({ name: 'auxiliaries directory' });
        return next({ name: '404' });
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ni/config/company',
        name: 'company config',
        component: () => import('src/modules/client/pages/ni/config/CompanyConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/rh',
        name: 'rh config',
        component: () => import('src/modules/client/pages/ni/config/RhConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/customers',
        name: 'customers config',
        component: () => import('src/modules/client/pages/ni/config/CustomersConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/coachs',
        name: 'coachs',
        component: () => import('src/modules/client/pages/ni/config/CoachConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/tags',
        name: 'tags config',
        component: () => import('src/modules/client/pages/ni/config/TagConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/billing/to-bill',
        name: 'to bill',
        component: () => import('src/modules/client/pages/ni/billing/ToBill'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/credit-notes',
        name: 'credit note',
        component: () => import('src/modules/client/pages/ni/billing/CreditNotes'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/clients-balances',
        name: 'clients balances',
        component: () => import('src/modules/client/pages/ni/billing/ClientsBalances'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/tpp-bill-slips',
        name: 'tpp bill slips',
        component: () => import('src/modules/client/pages/ni/billing/TppBillSlips'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/debits-archive',
        name: 'debits archive',
        component: () => import('src/modules/client/pages/ni/billing/DebitsArchive'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'billing',
        },
      },
      {
        path: 'ni/pay/to-pay',
        name: 'to pay',
        component: () => import('src/modules/client/pages/ni/pay/ToPay'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/contract-ends',
        name: 'contract ends',
        component: () => import('src/modules/client/pages/ni/pay/ContractEnds'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN],
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/contract-monitoring',
        name: 'contract monitoring',
        component: () => import('src/modules/client/pages/ni/pay/ContractMonitoring'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/absences',
        name: 'absences',
        component: () => import('src/modules/client/pages/ni/pay/Absences'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'pay',
        },
      },
      {
        path: 'ni/exports/data',
        name: 'data',
        component: () => import('src/modules/client/pages/ni/exports/DataExports'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'exports',
        },
      },
      {
        path: 'ni/exports/history',
        name: 'history',
        component: () => import('src/modules/client/pages/ni/exports/HistoryExports'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'exports',
        },
      },
      {
        path: 'ni/auxiliaries',
        name: 'auxiliaries directory',
        component: () => import('src/modules/client/pages/ni/auxiliaries/Directory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/dashboard',
        name: 'dashboard',
        component: () => import('src/modules/client/pages/ni/auxiliaries/Dashboard'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT],
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/staff-register',
        name: 'staff register',
        component: () => import('src/modules/client/pages/ni/auxiliaries/StaffRegister'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/:auxiliaryId',
        name: 'personal info',
        component: () => import('src/modules/client/pages/ni/auxiliaries/AuxiliaryProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'teams',
        },
      },
      {
        path: 'ni/customers',
        name: 'customers directory',
        component: () => import('src/modules/client/pages/ni/customers/CustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'benef',
        },
      },
      {
        path: 'ni/customers/fundings',
        name: 'customers fundings monitoring',
        component: () => import('src/modules/client/pages/ni/customers/CustomersFundingsMonitoring'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [...COACH_ROLES, AUXILIARY, PLANNING_REFERENT],
          parent: 'benef',
        },
      },
      {
        path: 'ni/customers/:customerId',
        name: 'customers profile',
        props: true,
        component: () => import('src/modules/client/pages/ni/customers/CustomerProfile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: COACH_ROLES,
          parent: 'benef',
        },
      },
      {
        path: 'ni/planning/auxiliaries',
        name: 'auxiliaries planning',
        component: () => import('src/modules/client/pages/ni/planning/AuxiliaryPlanning'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN, COACH, AUXILIARY, PLANNING_REFERENT],
          parent: 'planning',
        },
      },
      {
        path: 'ni/planning/customers',
        name: 'customers planning',
        component: () => import('src/modules/client/pages/ni/planning/CustomerPlanning'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [CLIENT_ADMIN, COACH, AUXILIARY, PLANNING_REFERENT],
          parent: 'planning',
        },
      },
      // Auxiliary view routes
      {
        path: 'auxiliaries/agenda',
        name: 'auxiliary agenda',
        component: () => import('src/modules/client/pages/auxiliaries/planning/AuxiliaryAgenda'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
          parent: 'planning',
        },
      },
      {
        path: 'auxiliaries/teams',
        name: 'teams directory',
        component: () => import('src/modules/client/pages/auxiliaries/teams/TeamsDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
          parent: 'teams',
        },
      },
      {
        path: 'auxiliaries/customers',
        name: 'profile customers',
        component: () => import('src/modules/client/pages/auxiliaries/customers/AuxiliaryCustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
          parent: 'benef',
        },
      },
      {
        path: 'auxiliaries/customers/:customerId',
        name: 'profile customers info',
        props: true,
        component: () => import('src/modules/client/pages/auxiliaries/customers/CustomerInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
        },
      },
      {
        path: 'auxiliaries/pay',
        name: 'profile salaries',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Salaries'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: AUXILIARY_ROLES,
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/docs',
        name: 'profile docs',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/contracts',
        name: 'profile contracts',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Contracts'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: AUXILIARY_ROLES,
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/info',
        name: 'auxiliary personal info',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Info'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [AUXILIARY, PLANNING_REFERENT],
          parent: 'administrative',
        },
      },
      // Customers view routes
      {
        path: 'customers/agenda',
        name: 'customer agenda',
        component: () => import('src/modules/client/pages/customers/CustomerAgenda'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [HELPER],
        },
      },
      {
        path: 'customers/contact',
        name: 'customer contact',
        component: () => import('src/modules/client/pages/customers/Contact'),
        async beforeEnter (to, from, next) {
          const loggedUser = store.state.main.loggedUser;
          const customer = await Customers.getById(loggedUser.customers[0]._id);
          return get(loggedUser, 'company.billingAssistance') || customer.referent
            ? next()
            : next('/404');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [HELPER],
        },
      },
      {
        path: 'customers/documents',
        name: 'customer documents',
        component: () => import('src/modules/client/pages/customers/Billing'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [HELPER],
        },
      },
      {
        path: 'customers/subscriptions',
        name: 'customer subscription',
        component: () => import('src/modules/client/pages/customers/Subscriptions'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [HELPER],
        },
      },
      {
        path: 'customers/contracts',
        name: 'customer contracts',
        component: () => import('src/modules/client/pages/customers/Contracts'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [HELPER],
        },
      },
      // All profiles
      {
        path: ':id/account',
        name: 'client account info',
        component: () => import('src/core/pages/AccountInfo'),
        beforeEnter (to, from, next) {
          return to.params.id === Cookies.get('user_id') ? next() : next('/404');
        },
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          roles: [...COACH_ROLES, ...AUXILIARY_ROLES, HELPER],
        },
      },
    ],
  },
];

export default routes;
