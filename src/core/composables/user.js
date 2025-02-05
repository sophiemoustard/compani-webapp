import { ref, computed, nextTick, useTemplateRef } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { useValidations } from '@composables/validations';
import { REQUIRED_LABEL } from '@data/constants';
import { formatPhoneForPayload } from '@helpers/utils';
import useVuelidate from '@vuelidate/core';
import Users from '@api/Users';

export const useUser = () => {
  const emailLock = ref(true);
  const userEmail = useTemplateRef('userEmail');
  const tmpInput = ref('');

  const $store = useStore();
  const userProfile = computed(() => $store.state.main.loggedUser);

  const $nextTick = nextTick;

  const { waitForValidation } = useValidations();
  const v$ = useVuelidate();

  const lockIcon = computed(() => (emailLock.value ? 'lock' : 'lock_open'));

  const refreshUser = async () => {
    await $store.dispatch('main/fetchLoggedUser', userProfile.value._id);
  };

  const updateAlenviUser = async (path) => {
    try {
      const value = get(userProfile.value, path);
      const payload = set({}, path, value);

      await Users.updateById(userProfile.value._id, payload);
      await refreshUser();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const emailErrorHandler = async () => {
    try {
      NotifyNegative('Email déjà existant.');
      userProfile.value.local.email = tmpInput.value;
      await $nextTick();
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
    console.log('user email', userEmail.value);
    if (emailLock.value) {
      emailLock.value = false;
      await $nextTick();
      userEmail.value.focus();
      console.log('ici');
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
