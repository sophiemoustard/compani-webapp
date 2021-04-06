import get from 'lodash/get';

export const partnerOrganizationMixin = {
  methods: {
    addressError (validationObj) {
      if (!get(validationObj, 'address.fullAddress.frAddress')) return 'Adresse invalide';
      return '';
    },
    phoneNumberError (validationObj) {
      if (!validationObj.phone.frPhoneNumber) return 'Numéro de téléphone invalide';
      return '';
    },
    emailError (validationObj) {
      if (!validationObj.email.email) return 'Email non valide';
      return '';
    },
  },
};
