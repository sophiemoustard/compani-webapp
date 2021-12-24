import get from 'lodash/get';
import { REQUIRED_LABEL } from '@data/constants';

export const establishmentMixin = {
  methods: {
    establishmentNameError (validationObj) {
      if (get(validationObj, 'name.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'name.maxLength.$response') === false) return '32 caractères maximimum';
      return '';
    },
    establishmentSiretError (validationObj) {
      if (get(validationObj, 'siret.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'siret.validSiret.$response') === false) return 'Siret non valide';
      return '';
    },
    establishmentAddressError (validationObj) {
      if (get(validationObj, 'address.fullAddress.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'address.fullAddress.frAddress.$response') === false) return 'Adresse invalide';
      return '';
    },
    establishmentPhoneError (validationObj) {
      if (get(validationObj, 'phone.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'phone.frPhoneNumber.$response') === false) return 'Numéro de téléphone invalide';
      return '';
    },
    establishmentWhsError (validationObj) {
      if (get(validationObj, 'workHealthService.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'workHealthService.validWorkHealthService.$response') === false) {
        return 'Service de santé du travail invalide';
      }
      return '';
    },
    establishmentUrssafCodeError (validationObj) {
      if (get(validationObj, 'urssafCode.required.$response') === false) return REQUIRED_LABEL;
      if (get(validationObj, 'urssafCode.validUrssafCode.$response') === false) return 'Code URSSAF invalide';
      return '';
    },
  },
};
