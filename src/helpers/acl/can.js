import get from 'lodash/get';
import rules from './rules';

const findPermission = (right, params) => {
  return (permission) => {
    if (permission.rule) {
      if (!rules[permission.rule]) throw new Error('[can] rule does not exist')
      return permission.name === right.permission && right.hasAccess && rules[permission.rule](params);
    }
    return permission.name === right.permission;
  }
}

export const can = (params) => {
  const rights = get(params, 'user.role.client.rights') || [];
  return rights.filter(right => right ? params.permissions.some(findPermission(right, params)) : false).length > 0;
};
