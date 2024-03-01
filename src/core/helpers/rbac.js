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
  { name: 'ni exports data', subscription: ERP },
  { name: 'ni exports history', subscription: ERP },
  { name: 'ni auxiliaries', subscription: ERP },
  { name: 'ni auxiliaries info', subscription: ERP },
  { name: 'ni customers', subscription: ERP },
  { name: 'ni customers info', subscription: ERP },
  { name: 'ni planning auxiliaries', subscription: ERP },
  { name: 'ni planning customers', subscription: ERP },
  { name: 'account client' },
  { name: 'ni courses' },
  { name: 'ni courses dashboard' },
  { name: 'ni courses info' },
  { name: 'ni courses learners' },
  { name: 'ni courses learners info' },
  { name: 'ni courses contacts' },
  { name: 'ni elearning courses' },
  { name: 'ni elearning courses info' },
];
const clientAdminRoutes = [
  ...coachRoutes,
  { name: 'ni config company' },
  { name: 'ni config rh', subscription: ERP },
  { name: 'ni config customers', subscription: ERP },
  { name: 'ni config coach' },
  { name: 'ni config tags', subscription: ERP },
  { name: 'ni billing to bill', subscription: ERP },
  { name: 'ni billing manual bills', subscription: ERP },
  { name: 'ni billing credit note', subscription: ERP },
  { name: 'ni billing clients balances', subscription: ERP },
  { name: 'ni billing tpp bill slips', subscription: ERP },
  { name: 'ni billing debits archive', subscription: ERP },
  { name: 'ni billing automatic bills', subscription: ERP },
  { name: 'ni courses bills' },
];
const auxiliaryRoutes = [
  { name: 'auxiliaries customers', subscription: ERP },
  { name: 'auxiliaries customers info', subscription: ERP },
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
const planningReferentRoutes = [
  ...auxiliaryRoutes,
];
const helperRoutes = [
  { name: 'customers documents', subscription: ERP },
  { name: 'account client' },
];
const trainingOrganisationManagerRoutes = [
  { name: 'ni users companies' },
  { name: 'ni users holdings' },
  { name: 'ni users companies info' },
  { name: 'ni users holdings info' },
  { name: 'ni users trainers' },
  { name: 'ni users trainers info' },
  { name: 'ni users learners' },
  { name: 'ni users learners info' },
  { name: 'ni pedagogy programs' },
  { name: 'ni pedagogy categories' },
  { name: 'ni pedagogy programs info' },
  { name: 'ni pedagogy activity info' },
  { name: 'ni pedagogy questionnaires' },
  { name: 'ni pedagogy questionnaire profile' },
  { name: 'ni management blended courses' },
  { name: 'ni management blended courses info' },
  { name: 'ni management elearning courses' },
  { name: 'ni management elearning courses info' },
  { name: 'ni management questionnaire answers' },
  { name: 'account vendor' },
  { name: 'ni exports history vendor' },
  { name: 'ni config main' },
];
const vendorAdminRoutes = [...trainingOrganisationManagerRoutes];
const trainerRoutes = [
  { name: 'trainers courses' },
  { name: 'trainers courses info' },
  { name: 'trainers info' },
  { name: 'trainers contracts' },
  { name: 'account vendor' },
  { name: 'ni management questionnaire answers' },
];

export const roleBasedAccessControl = {
  [CLIENT_ADMIN]: clientAdminRoutes,
  [COACH]: coachRoutes,
  [AUXILIARY_WITHOUT_COMPANY]: auxiliaryWithoutCompanyRoutes,
  [AUXILIARY]: auxiliaryRoutes,
  [PLANNING_REFERENT]: planningReferentRoutes,
  [HELPER]: helperRoutes,
  [VENDOR_ADMIN]: vendorAdminRoutes,
  [TRAINING_ORGANISATION_MANAGER]: trainingOrganisationManagerRoutes,
  [TRAINER]: trainerRoutes,
};
