
import { Ability, AbilityBuilder } from '@casl/ability';
import { CLIENT_ADMIN, COACH, PLANNING_REFERENT, AUXILIARY, HELPER } from '@data/constants';

const coachRoutes = [
  'ni pay contract monitoring',
  'ni pay absences',
  'ni exports data',
  'ni exports history',
  'ni auxiliaries directory',
  'ni auxiliaries dashboard',
  'ni auxiliaries staff register',
  'ni auxiliaries info',
  'ni customers directory',
  'ni customers fundings monitoring',
  'ni customers info',
  'ni planning auxiliaries',
  'ni planning customers',
  'account client',
];
const clientAdminRoutes = [
  ...coachRoutes,
  'ni config company',
  'ni config rh',
  'ni config customers',
  'ni config coach',
  'ni config tags',
  'ni billing to bill',
  'ni billing credit note',
  'ni billing clients balances',
  'ni billing tpp bill slips',
  'ni billing debits archive',
  'ni pay to pay',
  'ni pay contract ends',
];
const auxiliaryRoutes = [
  'auxiliaries agenda',
  'ni planning auxiliaries',
  'ni planning customers',
  'ni auxiliaries dashboard',
  'auxiliaries teams directory',
  'auxiliaries customers directory',
  'auxiliaries customers info',
  'auxiliaries pay',
  'auxiliaries docs',
  'auxiliaries contracts',
  'auxiliaries info',
  'account client',
];
const planningReferentRoutes = [...auxiliaryRoutes];
const helperRoutes = [
  'customers agenda',
  'customers contact',
  'customers documents',
  'customers subscription',
  'customers contracts',
  'account client',
];

const roleBasedAccessControl = {
  [CLIENT_ADMIN]: clientAdminRoutes,
  [COACH]: coachRoutes,
  [AUXILIARY]: auxiliaryRoutes,
  [PLANNING_REFERENT]: planningReferentRoutes,
  [HELPER]: helperRoutes,
}

export const defineAbilitiesFor = (clientRole) => {
  const { can, rules } = new AbilityBuilder();

  can('read', roleBasedAccessControl[clientRole]);

  return new Ability(rules);
}
