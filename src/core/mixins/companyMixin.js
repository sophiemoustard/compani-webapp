import get from 'lodash/get';
import { required, requiredIf, maxLength, minLength, email } from 'vuelidate/lib/validators';
import {
  frAddress,
  iban,
  bic,
  apeCode,
  rcs,
  validTradeName,
} from '@helpers/vuelidateCustomVal';
import { COMPANY, ASSOCIATION, REQUIRED_LABEL } from '@data/constants';

export const companyMixin = {
  data () {
    return {
      companyValidation: {
        apeCode: { required, apeCode },
        ics: { required },
        name: { required },
        tradeName: { validTradeName },
        type: { required },
        rcs: {
          required: requiredIf(item => item.type === COMPANY),
          rcs,
          maxLength: maxLength(9),
          minLength: minLength(9),
        },
        rna: {
          required: requiredIf(item => item.type === ASSOCIATION),
          rcs,
          maxLength: maxLength(9),
          minLength: minLength(9),
        },
        iban: { required, iban },
        bic: { required, bic },
        billingAssistance: { email },
        legalRepresentative: {
          lastname: { required },
          firstname: { required },
          position: { required },
        },
        address: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { required, frAddress },
          location: { required },
        },
      },
    };
  },
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
