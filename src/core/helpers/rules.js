import get from 'lodash/get';
import { AUXILIARY } from '@data/constants';

export default {
  isAuxiliaryOrOwner (params) {
    if (!params.user._id || !params.auxiliaryIdEvent) throw new Error('[can] wrong rule parameters');
    return get(params, 'user.role.client.name') !== AUXILIARY || params.user._id === params.auxiliaryIdEvent;
  },
}
