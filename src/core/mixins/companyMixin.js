import { required, requiredIf, maxLength, minLength } from 'vuelidate/lib/validators';
import {
  frAddress,
  iban,
  bic,
  apeCode,
  rcs,
} from '@helpers/vuelidateCustomVal';
import { COMPANY, ASSOCIATION, REQUIRED_LABEL } from '@data/constants';

export const companyMixin = {
  data () {
    return {
      companyValidation: {
        apeCode: { required, apeCode },
        ics: { required },
        name: { required },
        tradeName: { required, maxLength: maxLength(11) },
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
      else if (!this.$v.company.iban.iban) return 'IBAN non valide';

      return '';
    },
    bicError () {
      if (!this.$v.company.bic.required) return REQUIRED_LABEL;
      else if (!this.$v.company.bic.bic) return 'BIC non valide';

      return '';
    },
    rcsError () {
      if (!this.$v.company.rcs.required) return REQUIRED_LABEL;
      else if (!this.$v.company.rcs.maxLength || !this.$v.company.rcs.minLength) {
        return 'Doit contenir 9 caractères (espaces inclus).';
      }

      return '';
    },
  },
  methods: {
    tradeNameError (validation) {
      if (!validation.tradeName.required) return REQUIRED_LABEL;
      else if (!validation.tradeName.maxLength) return 'Doit contenir 11 caractères (espaces inclus).';

      return '';
    },
  },
}
