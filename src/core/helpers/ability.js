
import { Ability, AbilityBuilder } from '@casl/ability';
import { roleBasedAccessControl } from '@helpers/rbac';
import { CLIENT_ADMIN, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';

const getClientAbilities = (role, subscriptions) => {
  return roleBasedAccessControl[role]
    .filter(r => !r.subscription || subscriptions.includes(r.subscription))
    .map(r => r.name);
};

const getVendorAbilities = role => roleBasedAccessControl[role].map(r => r.name);

export const defineAbilitiesFor = (clientRole, vendorRole, company) => {
  const { can, rules } = new AbilityBuilder();

  const companySubscriptions = company
    ? Object.keys(company.subscriptions).filter(key => company.subscriptions[key])
    : [];
  if (clientRole) can('read', getClientAbilities(clientRole, companySubscriptions));
  if (vendorRole) can('read', getVendorAbilities(vendorRole));
  if (clientRole === CLIENT_ADMIN && companySubscriptions.includes('erp')) can('update', 'erp_config');
  if ([VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole)) can('set', 'user_company');

  return new Ability(rules);
}
