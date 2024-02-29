import get from 'lodash/get';
import { canNavigate } from '@helpers/alenvi';
import {
  HELPER,
  AUXILIARY_ROLES,
  COACH_ROLES,
  AUXILIARY_WITHOUT_COMPANY,
} from 'src/core/data/constants';
import store from 'src/store/index';
import { logOutAndRedirectToLogin } from 'src/router/redirect';

const routes = [
  {
    path: '/',
    components: { default: () => import('src/modules/client/layouts/Layout') },
    beforeEnter: async (to, from, next) => {
      try {
        if (to.path !== '/') return next();

        const canNav = await canNavigate();
        if (!canNav) return logOutAndRedirectToLogin();

        const userVendorRole = store.getters['main/getVendorRole'];
        const userClientRole = store.getters['main/getClientRole'];
        if (!userClientRole && !userVendorRole) return next({ name: 'account client' });
        if (!userClientRole) return next({ path: '/ad' });

        const company = store.getters['main/getCompany'];
        if (userClientRole === HELPER) return next({ name: 'customers documents' });
        if (userClientRole === AUXILIARY_WITHOUT_COMPANY) {
          return next({ name: 'account client' });
        }
        if (AUXILIARY_ROLES.includes(userClientRole)) {
          if (get(company, 'subscriptions.erp')) return next({ name: 'auxiliaries pay' });
          return next({ name: 'account client' });
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
        path: 'ni/billing/manual-bills',
        name: 'ni billing manual bills',
        component: () => import('src/modules/client/pages/ni/billing/ManualBills'),
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
        path: 'ni/billing/bills',
        name: 'ni billing automatic bills',
        component: () => import('src/modules/client/pages/ni/billing/Bills'),
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
        props: route => ({ ...route.params, ...route.query }),
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
      { // must be last of ni/customers/... routes
        path: 'ni/customers/:customerId',
        name: 'ni customers info',
        props: route => ({ ...route.params, ...route.query }),
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
        props: route => ({ ...route.query }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'ni/planning/customers',
        name: 'ni planning customers',
        component: () => import('src/modules/client/pages/ni/planning/CustomerPlanning'),
        props: route => ({ ...route.query }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'ni/planning/repetitions',
        name: 'ni planning repetitions',
        component: () => import('src/modules/client/pages/ni/planning/RepetitionsPlanning'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'planning',
        },
      },
      {
        path: 'ni/courses',
        name: 'ni courses',
        component: () => import('src/modules/client/pages/ni/courses/BlendedCoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/dashboard',
        name: 'ni courses dashboard',
        component: () => import('src/modules/client/pages/ni/courses/Dashboard'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/elearning-courses',
        name: 'ni elearning courses',
        component: () => import('src/modules/client/pages/ni/courses/ELearningCoursesDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/elearning-courses/:courseId',
        name: 'ni elearning courses info',
        component: () => import('src/modules/client/pages/ni/courses/ELearningCourseProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/learners',
        name: 'ni courses learners',
        component: () => import('src/modules/client/pages/ni/courses/LearnersDirectory'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/contacts',
        name: 'ni courses contacts',
        component: () => import('src/modules/client/pages/ni/courses/ContactProfile'),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/users/learners/:learnerId',
        name: 'ni courses learners info',
        component: () => import('src/modules/client/pages/ni/courses/LearnerProfile'),
        beforeEnter: async (to, from, next) => {
          try {
            if (from.name === 'ni courses info') to.query.defaultTab = 'courses';
            if (from.name === 'ni elearning courses info') to.query.defaultTab = 'courses';

            return next();
          } catch (e) {
            console.error(e);
          }
        },
        props: route => ({ ...route.params, ...route.query }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/:courseId',
        name: 'ni courses info',
        component: () => import('src/modules/client/pages/ni/courses/BlendedCourseProfile'),
        beforeEnter: async (to, from, next) => {
          try {
            if (from.name === 'ni courses learners info') to.query.defaultTab = 'traineeFollowUp';

            return next();
          } catch (e) {
            console.error(e);
          }
        },
        props: route => ({ ...route.params, ...route.query }),
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      {
        path: 'ni/courses/bills',
        name: 'ni courses bills',
        component: () => import('src/modules/client/pages/ni/courses/BillingProfile'),
        props: true,
        meta: {
          cookies: ['alenvi_token', 'refresh_token'],
          parent: 'courses',
        },
      },
      // Auxiliary view routes
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
        path: 'customers/documents',
        name: 'customers documents',
        component: () => import('src/modules/client/pages/customers/Billing'),
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
