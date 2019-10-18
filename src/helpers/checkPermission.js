import intersection from 'lodash/intersection';
import redirect from '../router/redirect';

export const checkPermission = (to, user) => {
  try {
    if (to.meta.permissions) {
      if (user.role && user.role.rights) {
        const rights = user.role.rights.map(right => right.permission);

        const count =
          typeof to.meta.permissions === 'string'
            ? rights.includes(to.meta.permissions)
            : intersection(rights, to.meta.permissions).length;

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
