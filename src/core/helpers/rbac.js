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
  ERP,
} from '@data/constants';

const coachRoutes = [
  { name: 'ni pay contract monitoring', subscription: ERP },
  { name: 'ni pay absences', subscription: ERP },
  { name: 'ni exports data', subscription: ERP },
  { name: 'ni exports history', subscription: ERP },
  { name: 'ni auxiliaries', subscription: ERP },
  { name: 'ni auxiliaries dashboard', subscription: ERP },
  { name: 'ni auxiliaries info', subscription: ERP },
  { name: 'ni customers', subscription: ERP },
  { name: 'ni customers fundings monitoring', subscription: ERP },
  { name: 'ni customers info', subscription: ERP },
  { name: 'ni planning auxiliaries', subscription: ERP },
  { name: 'ni planning customers', subscription: ERP },
  { name: 'account client' },
  { name: 'ni courses' },
  { name: 'ni courses info' },
];
const clientAdminRoutes = [
  ...coachRoutes,
  { name: 'ni auxiliaries staff register', subscription: ERP },
  { name: 'ni config company' },
  { name: 'ni config rh', subscription: ERP },
  { name: 'ni config customers', subscription: ERP },
  { name: 'ni config coach' },
  { name: 'ni config tags', subscription: ERP },
  { name: 'ni billing to bill', subscription: ERP },
  { name: 'ni billing credit note', subscription: ERP },
  { name: 'ni billing clients balances', subscription: ERP },
  { name: 'ni billing tpp bill slips', subscription: ERP },
  { name: 'ni billing debits archive', subscription: ERP },
  { name: 'ni pay to pay', subscription: ERP },
  { name: 'ni pay contract ends', subscription: ERP },
];
const auxiliaryRoutes = [
  { name: 'auxiliaries agenda', subscription: ERP },
  { name: 'ni planning auxiliaries', subscription: ERP },
  { name: 'ni planning customers', subscription: ERP },
  { name: 'ni auxiliaries dashboard', subscription: ERP },
  { name: 'auxiliaries teams', subscription: ERP },
  { name: 'auxiliaries customers', subscription: ERP },
  { name: 'auxiliaries customers info', subscription: ERP },
  { name: 'ni customers fundings monitoring', subscription: ERP },
  { name: 'auxiliaries pay', subscription: ERP },
  { name: 'auxiliaries docs', subscription: ERP },
  { name: 'auxiliaries contracts', subscription: ERP },
  { name: 'auxiliaries info', subscription: ERP },
  { name: 'account client' },
];
const auxiliaryWithoutCompanyRoutes = [
  { name: 'auxiliaries pay', subscription: ERP },
  { name: 'auxiliaries contracts', subscription: ERP },
  { name: 'account client' },
];
const planningReferentRoutes = [...auxiliaryRoutes];
const helperRoutes = [
  { name: 'customers agenda', subscription: ERP },
  { name: 'customers contact', subscription: ERP },
  { name: 'customers documents', subscription: ERP },
  { name: 'customers subscription', subscription: ERP },
  { name: 'customers contracts', subscription: ERP },
  { name: 'account client' },
];
const vendorAdminRoutes = [
  { name: 'ni users companies' },
  { name: 'ni users companies info' },
  { name: 'ni users trainers' },
  { name: 'ni users trainers info' },
  { name: 'ni config programs' },
  { name: 'ni config programs info' },
  { name: 'ni config programs step activity info' },
  { name: 'ni management courses' },
  { name: 'ni management courses info' },
  { name: 'account vendor' },
];
const trainingOrgnaisationManagerRoutes = [
  { name: 'ni users companies' },
  { name: 'ni users companies info' },
  { name: 'ni users trainers' },
  { name: 'ni users trainers info' },
  { name: 'ni config programs' },
  { name: 'ni config programs info' },
  { name: 'ni config programs step activity info' },
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
