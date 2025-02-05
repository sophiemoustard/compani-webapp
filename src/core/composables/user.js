import { ref, computed, nextTick, useTemplateRef } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { useValidations } from '@composables/validations';
import { REQUIRED_LABEL } from '@data/constants';
import { formatPhoneForPayload } from '@helpers/utils';

export const useUser = (updateAlenviUser, v$) => {
  const emailLock = ref(true);
  const userEmail = useTemplateRef('userEmail');
  const tmpInput = ref('');

  const $store = useStore();
  const userProfile = computed(() => $store.state.main.loggedUser);

  const { waitForValidation } = useValidations();

  const lockIcon = computed(() => (emailLock.value ? 'lock' : 'lock_open'));

  const emailErrorHandler = async () => {
    try {
      NotifyNegative('Email déjà existant.');
      userProfile.value.local.email = tmpInput.value;
      await nextTick();
      userEmail.value.select();
    } catch (e) {
      console.error(e);
    }
  };

  const updateUser = async (path) => {
    try {
      if (tmpInput.value === get(userProfile.value, path)) {
        if (path === 'local.email' && tmpInput.value !== '') emailLock.value = true;
        return;
      }

      if (get(v$.value.userProfile, path)) {
        get(v$.value.userProfile, path).$touch();
        const isValid = await waitForValidation(v$.value.userProfile, path);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
      }
      if (path === 'contact.phone') {
        userProfile.value.contact.phone = formatPhoneForPayload(userProfile.value.contact.phone);
      }

      await updateAlenviUser(path);
      emailLock.value = true;
      NotifyPositive('Modification enregistrée.');
    } catch (e) {
      console.error(e);
      if (e.status === 409) return emailErrorHandler(path);
      NotifyNegative('Erreur lors de la modification.');
    } finally {
      tmpInput.value = '';
    }
  };

  const toggleEmailLock = async () => {
    if (emailLock.value) {
      emailLock.value = false;
      await nextTick();
      userEmail.value.focus();
    } else {
      await updateUser('local.email');
    }
  };

  const emailError = (validationObj) => {
    if (get(validationObj, 'local.email.required.$response') === false) return REQUIRED_LABEL;
    if (get(validationObj, 'local.email.email.$response') === false) return 'Email non valide';
    return '';
  };

  return {
    // Data
    emailLock,
    userEmail,
    tmpInput,
    userProfile,
    // Computed
    lockIcon,
    // Methods
    toggleEmailLock,
    updateUser,
    emailErrorHandler,
    emailError,
    v$,
  };
};
