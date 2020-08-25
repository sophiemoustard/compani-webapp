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
      return !this.$v.company.address.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.company.iban.required) return REQUIRED_LABEL;
      if (!this.$v.company.iban.iban) return 'IBAN non valide';

      return '';
    },
    bicError () {
      if (!this.$v.company.bic.required) return REQUIRED_LABEL;
      if (!this.$v.company.bic.bic) return 'BIC non valide';

      return '';
    },
    rcsError () {
      if (!this.$v.company.rcs.required) return REQUIRED_LABEL;
      if (!this.$v.company.rcs.maxLength || !this.$v.company.rcs.minLength) {
        return 'Doit contenir 9 caractères (espaces inclus).';
      }

      return '';
    },
    billingAssistanceError () {
      if (!this.$v.company.billingAssistance.email) return 'Email non valide';
      return '';
    },
  },
  methods: {
    tradeNameError (validation) {
      if (!validation.tradeName.validTradeName) {
        return 'Doit contenir maximum 11 caractères, uniquement alphanumériques.';
      }

      return '';
    },
  },
};
