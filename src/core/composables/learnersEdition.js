import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import get from 'lodash/get';
import { TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';

export const useLearnersEdition = () => {
  const $router = useRouter();
  const $store = useStore();

  const isVendorInterface = /\/ad\//.test($router.currentRoute.value.path);
  const loggedUser = computed(() => $store.state.main.loggedUser);
  const isRofOrAdmin = computed(() => [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN]
    .includes(get(loggedUser.value, 'role.vendor.name')));

  const canAccesOrEditTrainee = (trainee) => {
    const loggedUserCompany = get(loggedUser.value, 'company._id');
    const traineeCurrentCompany = trainee.company;

    return ((isVendorInterface && isRofOrAdmin) || (!isVendorInterface && loggedUserCompany === traineeCurrentCompany));
  };

  return {
    // Methods
    canAccesOrEditTrainee,
  };
};
