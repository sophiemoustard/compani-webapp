import get from 'lodash/get';

export const checkRole = (to, user) => {
  try {
    if (to.meta.roles) {
      const role = get(user, 'role.client.name', null);
      if (to.meta.roles.includes(role)) return true;
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
