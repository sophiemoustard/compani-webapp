import { ref } from 'vue';
// import get from 'lodash/get';
import { minLength } from '@vuelidate/validators';
import { REQUIRED_LABEL } from '@data/constants';

export const usePassword = () => {
  const passwordValidation = ref({ minLength: minLength(6) });

  const passwordError = (validationObj) => {
    if (validationObj.required.$response === false) return REQUIRED_LABEL;
    if (validationObj.minLength.$response === false) return 'Le mot de passe doit contenir au minimum 6 caractères.';
    return '';
  };

  const passwordConfirmError = (validationObj) => {
    if (validationObj.required.$response === false) return REQUIRED_LABEL;
    if (validationObj.sameAs.$response === false) return 'Le mot de passe doit être identique.';
    return 'Mot de passe invalide';
  };

  return {
    // Data
    passwordValidation,
    // Methods
    passwordError,
    passwordConfirmError,
  };
};
