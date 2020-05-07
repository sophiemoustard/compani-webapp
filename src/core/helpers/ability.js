
import { Ability, AbilityBuilder } from '@casl/ability';
import { roleBasedAccessControl } from '@helpers/rbac';

const getClientAbilities = (role, subscriptions) => {
  return roleBasedAccessControl[role]
    .filter(r => !r.subscription || subscriptions.includes(r.subscription))
    .map(r => r.name);
};

const getVendorAbilities = role => roleBasedAccessControl[role].map(r => r.name);

export const defineAbilitiesFor = (clientRole, vendorRole, company) => {
  const { can, rules } = new AbilityBuilder();

  const companySubscriptions = Object.keys(company.subscriptions).filter(key => company.subscriptions[key]);
  if (clientRole) can('read', getClientAbilities(clientRole, companySubscriptions));
  if (vendorRole) can('read', getVendorAbilities(vendorRole));

  return new Ability(rules);
}
