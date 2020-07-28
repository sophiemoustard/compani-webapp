import get from 'lodash/get';
import Customers from '@api/Customers';
import { canNavigate } from '@helpers/alenvi';
import store from 'src/store/index';
import {
  HELPER,
  AUXILIARY_ROLES,
  COACH_ROLES,
  AUXILIARY_WITHOUT_COMPANY,
} from 'src/core/data/constants';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const routes = [
  {
    path: '/',
    components: { default: () => import('src/modules/client/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();

        if (!(await canNavigate())) return logOutAndRedirectToLogin();

        const loggedUser = store.state.main.loggedUser;
        const userVendorRole = store.getters['main/getVendorRole'];
        const userClientRole = store.getters['main/getClientRole'];
        if (!userClientRole && !userVendorRole) return next({ name: 'account client', params: { id: loggedUser._id } });
        if (!userClientRole) return next({ path: '/ad' });

        const company = store.getters['main/getCompany'];
        if (userClientRole === HELPER) return next({ name: 'customers agenda' });
        if (userClientRole === AUXILIARY_WITHOUT_COMPANY) {
          return next({ name: 'account client', params: { id: loggedUser._id } });
        }
        if (AUXILIARY_ROLES.includes(userClientRole)) {
          if (get(company, 'subscriptions.erp')) return next({ name: 'auxiliaries agenda' });
          return next({ name: 'account client', params: { id: loggedUser._id } });
        }
        if (COACH_ROLES.includes(userClientRole)) {
          if (get(company, 'subscriptions.erp')) return next({ name: 'ni auxiliaries' });
          return next({ name: 'ni courses' });
        }
        return next({ name: '404' });
      } catch (e) {
        console.error(e);
      }
    },
    children: [
      {
        path: 'ni/config/company',
        name: 'ni config company',
        component: () => import('src/modules/client/pages/ni/config/CompanyConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/rh',
        name: 'ni config rh',
        component: () => import('src/modules/client/pages/ni/config/RhConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/customers',
        name: 'ni config customers',
        component: () => import('src/modules/client/pages/ni/config/CustomersConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/coachs',
        name: 'ni config coach',
        component: () => import('src/modules/client/pages/ni/config/CoachConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/config/tags',
        name: 'ni config tags',
        component: () => import('src/modules/client/pages/ni/config/TagConfig'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'configuration',
        },
      },
      {
        path: 'ni/billing/to-bill',
        name: 'ni billing to bill',
        component: () => import('src/modules/client/pages/ni/billing/ToBill'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/credit-notes',
        name: 'ni billing credit note',
        component: () => import('src/modules/client/pages/ni/billing/CreditNotes'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/clients-balances',
        name: 'ni billing clients balances',
        component: () => import('src/modules/client/pages/ni/billing/ClientsBalances'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/tpp-bill-slips',
        name: 'ni billing tpp bill slips',
        component: () => import('src/modules/client/pages/ni/billing/TppBillSlips'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'billing',
        },
      },
      {
        path: 'ni/billing/debits-archive',
        name: 'ni billing debits archive',
        component: () => import('src/modules/client/pages/ni/billing/DebitsArchive'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'billing',
        },
      },
      {
        path: 'ni/pay/to-pay',
        name: 'ni pay to pay',
        component: () => import('src/modules/client/pages/ni/pay/ToPay'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/contract-ends',
        name: 'ni pay contract ends',
        component: () => import('src/modules/client/pages/ni/pay/ContractEnds'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/contract-monitoring',
        name: 'ni pay contract monitoring',
        component: () => import('src/modules/client/pages/ni/pay/ContractMonitoring'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'pay',
        },
      },
      {
        path: 'ni/pay/absences',
        name: 'ni pay absences',
        component: () => import('src/modules/client/pages/ni/pay/Absences'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'pay',
        },
      },
      {
        path: 'ni/exports/data',
        name: 'ni exports data',
        component: () => import('src/modules/client/pages/ni/exports/DataExports'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'exports',
        },
      },
      {
        path: 'ni/exports/history',
        name: 'ni exports history',
        component: () => import('src/modules/client/pages/ni/exports/HistoryExports'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'exports',
        },
      },
      {
        path: 'ni/auxiliaries',
        name: 'ni auxiliaries',
        component: () => import('src/modules/client/pages/ni/auxiliaries/Directory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/dashboard',
        name: 'ni auxiliaries dashboard',
        component: () => import('src/modules/client/pages/ni/auxiliaries/Dashboard'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/staff-register',
        name: 'ni auxiliaries staff register',
        component: () => import('src/modules/client/pages/ni/auxiliaries/StaffRegister'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'teams',
        },
      },
      {
        path: 'ni/auxiliaries/:auxiliaryId',
        name: 'ni auxiliaries info',
        component: () => import('src/modules/client/pages/ni/auxiliaries/AuxiliaryProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'teams',
        },
      },
      {
        path: 'ni/customers',
        name: 'ni customers',
        component: () => import('src/modules/client/pages/ni/customers/CustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'customers',
        },
      },
      {
        path: 'ni/customers/fundings',
        name: 'ni customers fundings monitoring',
        component: () => import('src/modules/client/pages/ni/customers/CustomersFundingsMonitoring'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'customers',
        },
      },
      {
        path: 'ni/customers/:customerId',
        name: 'ni customers info',
        props: true,
        component: () => import('src/modules/client/pages/ni/customers/CustomerProfile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'customers',
        },
      },
      {
        path: 'ni/planning/auxiliaries',
        name: 'ni planning auxiliaries',
        component: () => import('src/modules/client/pages/ni/planning/AuxiliaryPlanning'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'ni/planning/customers',
        name: 'ni planning customers',
        component: () => import('src/modules/client/pages/ni/planning/CustomerPlanning'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'ni/courses',
        name: 'ni courses',
        component: () => import('src/modules/client/pages/ni/courses/CoursesDirectory'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/:courseId',
        name: 'ni courses info',
        component: () => import('src/core/pages/courses/CourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      // Auxiliary view routes
      {
        path: 'auxiliaries/agenda',
        name: 'auxiliaries agenda',
        component: () => import('src/modules/client/pages/auxiliaries/planning/AuxiliaryAgenda'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'auxiliaries/teams',
        name: 'auxiliaries teams',
        component: () => import('src/modules/client/pages/auxiliaries/teams/TeamsDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'teams',
        },
      },
      {
        path: 'auxiliaries/customers',
        name: 'auxiliaries customers',
        component: () => import('src/modules/client/pages/auxiliaries/customers/AuxiliaryCustomersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'customers',
        },
      },
      {
        path: 'auxiliaries/customers/:customerId',
        name: 'auxiliaries customers info',
        props: true,
        component: () => import('src/modules/client/pages/auxiliaries/customers/CustomerInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'auxiliaries/pay',
        name: 'auxiliaries pay',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Salaries'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/docs',
        name: 'auxiliaries docs',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Documents'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/contracts',
        name: 'auxiliaries contracts',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Contracts'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'administrative',
        },
      },
      {
        path: 'auxiliaries/info',
        name: 'auxiliaries info',
        component: () => import('src/modules/client/pages/auxiliaries/administrative/Info'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'administrative',
        },
      },
      // Customers view routes
      {
        path: 'customers/agenda',
        name: 'customers agenda',
        component: () => import('src/modules/client/pages/customers/CustomerAgenda'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'customers/contact',
        name: 'customers contact',
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
        },
      },
      {
        path: 'customers/documents',
        name: 'customers documents',
        component: () => import('src/modules/client/pages/customers/Billing'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'customers/subscriptions',
        name: 'customers subscription',
        component: () => import('src/modules/client/pages/customers/Subscriptions'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      {
        path: 'customers/contracts',
        name: 'customers contracts',
        component: () => import('src/modules/client/pages/customers/Contracts'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
      // All profiles
      {
        path: 'account',
        name: 'account client',
        component: () => import('src/core/pages/AccountInfo'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
        },
      },
    ],
  },
];

export default routes;
