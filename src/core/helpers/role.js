import get from 'lodash/get';

export const checkRole = (to, user) => {
  try {
    if (to.meta.roles) {
      const roleClient = get(user, 'role.client.name', null);
      const roleVendor = get(user, 'role.vendor.name', null);
      if (to.meta.roles.includes(roleClient)) return true;
      if (to.meta.roles.includes(roleVendor)) return true;
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
