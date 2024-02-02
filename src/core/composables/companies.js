import get from 'lodash/get';
import { computed } from 'vue';
import { REQUIRED_LABEL } from '@data/constants';

export const useCompanies = (v$) => {
  const addressError = computed(() => {
    const validation = v$.company.address.fullAddress;
    if (get(validation, 'required.$response') === false) return REQUIRED_LABEL;
    if (get(validation, 'frAddress.$response') === false) return 'Adresse non valide';
    return '';
  });

  const tradeNameError = (validation) => {
    if (get(validation.tradeName, 'validTradeName.$response') === false) {
      return 'Doit contenir maximum 11 caractères, uniquement alphanumériques.';
    }

    return '';
  };

  return {
    // Computed
    addressError,
    // Methods
    tradeNameError,
  };
};
