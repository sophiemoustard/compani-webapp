import intersection from 'lodash/intersection';
import get from 'lodash/get';
import redirect from '../router/redirect';

export const checkPermission = (to, user) => {
  try {
    if (to.meta.permissions) {
      const rights = get(user, 'role.client.rights') || null;
      if (rights) {
        const rightPermissions = rights.map(right => right.permission);

        const count = typeof to.meta.permissions === 'string'
          ? rightPermissions.includes(to.meta.permissions)
          : intersection(rightPermissions, to.meta.permissions).length;

        return !!count;
      } else {
        return redirect.redirectToLogin({ to });
      }
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
