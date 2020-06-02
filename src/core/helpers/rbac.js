import {
  CLIENT_ADMIN,
  COACH,
  PLANNING_REFERENT,
  AUXILIARY,
  HELPER,
  VENDOR_ADMIN,
  TRAINER,
  TRAINING_ORGANISATION_MANAGER,
  AUXILIARY_WITHOUT_COMPANY,
} from '@data/constants';

const coachRoutes = [
  { name: 'ni pay contract monitoring', subscription: 'erp' },
  { name: 'ni pay absences', subscription: 'erp' },
  { name: 'ni exports data', subscription: 'erp' },
  { name: 'ni exports history', subscription: 'erp' },
  { name: 'ni auxiliaries', subscription: 'erp' },
  { name: 'ni auxiliaries dashboard', subscription: 'erp' },
  { name: 'ni auxiliaries info', subscription: 'erp' },
  { name: 'ni customers', subscription: 'erp' },
  { name: 'ni customers fundings monitoring', subscription: 'erp' },
  { name: 'ni customers info', subscription: 'erp' },
  { name: 'ni planning auxiliaries', subscription: 'erp' },
  { name: 'ni planning customers', subscription: 'erp' },
  { name: 'account client' },
  { name: 'ni courses' },
  { name: 'ni courses info' },
];
const clientAdminRoutes = [
  ...coachRoutes,
  { name: 'ni auxiliaries staff register', subscription: 'erp' },
  { name: 'ni config company' },
  { name: 'ni config rh', subscription: 'erp' },
  { name: 'ni config customers', subscription: 'erp' },
  { name: 'ni config coach' },
  { name: 'ni config tags', subscription: 'erp' },
  { name: 'ni billing to bill', subscription: 'erp' },
  { name: 'ni billing credit note', subscription: 'erp' },
  { name: 'ni billing clients balances', subscription: 'erp' },
  { name: 'ni billing tpp bill slips', subscription: 'erp' },
  { name: 'ni billing debits archive', subscription: 'erp' },
  { name: 'ni pay to pay', subscription: 'erp' },
  { name: 'ni pay contract ends', subscription: 'erp' },
];
const auxiliaryRoutes = [
  { name: 'auxiliaries agenda', subscription: 'erp' },
  { name: 'ni planning auxiliaries', subscription: 'erp' },
  { name: 'ni planning customers', subscription: 'erp' },
  { name: 'ni auxiliaries dashboard', subscription: 'erp' },
  { name: 'auxiliaries teams', subscription: 'erp' },
  { name: 'auxiliaries customers', subscription: 'erp' },
  { name: 'auxiliaries customers info', subscription: 'erp' },
  { name: 'ni customers fundings monitoring', subscription: 'erp' },
  { name: 'auxiliaries pay', subscription: 'erp' },
  { name: 'auxiliaries docs', subscription: 'erp' },
  { name: 'auxiliaries contracts', subscription: 'erp' },
  { name: 'auxiliaries info', subscription: 'erp' },
  { name: 'account client' },
];
const auxiliaryWithoutCompanyRoutes = [
  { name: 'auxiliaries pay', subscription: 'erp' },
  { name: 'auxiliaries contracts', subscription: 'erp' },
  { name: 'account client' },
];
const planningReferentRoutes = [...auxiliaryRoutes];
const helperRoutes = [
  { name: 'customers agenda', subscription: 'erp' },
  { name: 'customers contact', subscription: 'erp' },
  { name: 'customers documents', subscription: 'erp' },
  { name: 'customers subscription', subscription: 'erp' },
  { name: 'customers contracts', subscription: 'erp' },
  { name: 'account client' },
];
const vendorAdminRoutes = [
  { name: 'ni users companies' },
  { name: 'ni users companies info' },
  { name: 'ni users trainers' },
  { name: 'ni users trainers info' },
  { name: 'ni users programs' },
  { name: 'ni users programs info' },
  { name: 'ni management courses' },
  { name: 'ni management courses info' },
  { name: 'account vendor' },
];
const trainingOrgnaisationManagerRoutes = [
  { name: 'ni users companies' },
  { name: 'ni users companies info' },
  { name: 'ni users trainers' },
  { name: 'ni users trainers info' },
  { name: 'ni users programs' },
  { name: 'ni users programs info' },
  { name: 'ni management courses' },
  { name: 'ni management courses info' },
  { name: 'account vendor' },
];
const trainerRoutes = [
  { name: 'trainers courses' },
  { name: 'trainers courses info' },
  { name: 'trainers info' },
  { name: 'account vendor' },
];

export const roleBasedAccessControl = {
  [CLIENT_ADMIN]: clientAdminRoutes,
  [COACH]: coachRoutes,
  [AUXILIARY_WITHOUT_COMPANY]: auxiliaryWithoutCompanyRoutes,
  [AUXILIARY]: auxiliaryRoutes,
  [PLANNING_REFERENT]: planningReferentRoutes,
  [HELPER]: helperRoutes,
  [VENDOR_ADMIN]: vendorAdminRoutes,
  [TRAINING_ORGANISATION_MANAGER]: trainingOrgnaisationManagerRoutes,
  [TRAINER]: trainerRoutes,
};
