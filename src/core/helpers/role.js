import get from 'lodash/get';

export const checkRole = (to, user) => {
  try {
    if (to.meta.roles) {
      const roleClient = get(user, 'role.client.name', null);
      const roleVendor = get(user, 'role.vendor.name', null);
      return to.meta.roles.includes(roleClient) || to.meta.roles.includes(roleVendor);
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
