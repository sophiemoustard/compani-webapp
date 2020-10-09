import { REQUIRED_LABEL } from '@data/constants';

export const establishmentMixin = {
  methods: {
    establishmentNameError (validationObj) {
      if (!validationObj.name.required) return REQUIRED_LABEL;
      if (!validationObj.name.maxLength) return '32 caractères maximimum';
      return '';
    },
    establishmentSiretError (validationObj) {
      if (!validationObj.siret.required) return REQUIRED_LABEL;
      if (!validationObj.siret.validSiret) return 'Siret non valide';
      return '';
    },
    establishmentAddressError (validationObj) {
      if (!validationObj.address.required) return REQUIRED_LABEL;
      if (!validationObj.address.frAddress) return 'Adresse invalide';
      return '';
    },
    establishmentPhoneError (validationObj) {
      if (!validationObj.phone.required) return REQUIRED_LABEL;
      if (!validationObj.phone.frPhoneNumber) return 'Numéro de téléphone invalide';
      return '';
    },
    establishmentWhsError (validationObj) {
      if (!validationObj.workHealthService.required) return REQUIRED_LABEL;
      if (!validationObj.workHealthService.validWorkHealthService) return 'Service de santé du travail invalide';
      return '';
    },
    establishmentUrssafCodeError (validationObj) {
      if (!validationObj.urssafCode.required) return REQUIRED_LABEL;
      if (!validationObj.urssafCode.validUrssafCode) return 'Code URSSAF invalide';
      return '';
    },
  },
};
