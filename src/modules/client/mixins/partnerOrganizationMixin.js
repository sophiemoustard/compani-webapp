import get from 'lodash/get';

export const partnerOrganizationMixin = {
  methods: {
    addressError (validationObj) {
      if (get(validationObj, 'address.fullAddress.frAddress.$reponse') === false) return 'Adresse invalide';
      return '';
    },
    phoneNumberError (validationObj) {
      if (validationObj.phone.frPhoneNumber.$response === false) return 'Numéro de téléphone invalide';
      return '';
    },
    emailError (validationObj) {
      if (validationObj.email.email.$response === false) return 'Email non valide';
      return '';
    },
  },
};
