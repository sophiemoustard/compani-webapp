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
    ibanError () {
      const validation = this.v$.company.iban;
      if (get(validation, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(validation, 'iban.$response') === false) return 'IBAN non valide';

      return '';
    },
    bicError () {
      const validation = this.v$.company.bic;
      if (get(validation, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(validation, 'bic.$response') === false) return 'BIC non valide';

      return '';
    },
    rcsError () {
      const validation = this.v$.company.rcs;
      if (get(validation, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(validation, 'maxLength.$response') === false || get(validation, 'minLength.$response') === false ||
        get(validation, 'rcs.$response') === false) {
        return 'Doit contenir 9 chiffres.';
      }

      return '';
    },
    billingAssistanceError () {
      if (get(this.v$.company.billingAssistance, 'email.$response') === false) return 'Email non valide';

      return '';
    },
  },
  methods: {
    tradeNameError (validation) {
      if (get(validation.tradeName, 'validTradeName.$response') === false) {
        return 'Doit contenir maximum 11 caractères, uniquement alphanumériques.';
      }

      return '';
    },
  },
};
