
import { Ability, AbilityBuilder } from '@casl/ability';
import { roleBasedAccessControl } from '@helpers/rbac';
import { CLIENT_ADMIN, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, COACH, AUXILIARY } from '@data/constants';

const getClientAbilities = (role, subscriptions) => {
  return roleBasedAccessControl[role]
    .filter(r => !r.subscription || subscriptions.includes(r.subscription))
    .map(r => r.name);
};

const getVendorAbilities = role => roleBasedAccessControl[role].map(r => r.name);

export const defineAbilitiesFor = (clientRole, vendorRole, company, auxiliaryUserId = null, auxiliarySectorId = null) => {
  const { can, rules } = new AbilityBuilder();

  const companySubscriptions = company
    ? Object.keys(company.subscriptions).filter(key => company.subscriptions[key])
    : [];
  if (clientRole) can('read', getClientAbilities(clientRole, companySubscriptions));
  if (vendorRole) can('read', getVendorAbilities(vendorRole));
  if (!clientRole && !vendorRole) can('read', 'account client');
  if (clientRole === CLIENT_ADMIN && companySubscriptions.includes('erp')) can('update', 'erp_config');
  if ([VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole)) can('set', 'user_company');

  if ([CLIENT_ADMIN, COACH].includes(clientRole) && companySubscriptions.includes('erp')) can('edit', 'Events');
  if (clientRole === AUXILIARY && companySubscriptions.includes('erp')) {
    can('edit', 'Events', { auxiliaryId: { $eq: auxiliaryUserId } })
    can('edit', 'Events', { sectorId: { $eq: auxiliarySectorId } })
  }
  return new Ability(rules);
}
