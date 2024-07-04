import get from 'lodash/get';
import { REQUIRED_LABEL } from '@data/constants';

export const companyMixin = {
  computed: {
    addressError () {
      const validation = this.v$.company.address.fullAddress;
      if (get(validation, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(validation, 'frAddress.$response') === false) return 'Adresse non valide';
      return '';
    },
  },
};
