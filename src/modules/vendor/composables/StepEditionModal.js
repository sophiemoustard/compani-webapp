import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import pick from 'lodash/pick';
import { E_LEARNING, REQUIRED_LABEL } from '@data/constants';
import { required } from '@vuelidate/validators';
import Steps from '@api/Steps';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import CompaniDuration from '@helpers/dates/companiDurations';

export const useStepEditionModal = (
  isLocked,
  openValidateUnlockingEditionModal,
  refreshProgram,
  modalLoading,
  openNextModalAfterUnlocking
) => {
  const editedStep = ref({ name: '', type: E_LEARNING, theoreticalDuration: { hours: 'PT0H', minutes: 'PT0M' } });
  const stepEditionModal = ref(false);

  const validateISOHours = (value) => {
    if (!value) return true;

    return editedStep.value.theoreticalDuration.minutes === 'PT0M'
      ? !!value.match(/PT[1-9]\d*H/)
      : !!value.match(/PT[0-9]\d*H/);
  };

  const validateISOMinutes = (value) => {
    if (!value) return true;
    return editedStep.value.theoreticalDuration.hours === 'PT0H'
      ? !!value.match(/PT([1-9]|[1-5]\d)M/)
      : !!value.match(/PT(\d|[1-5]\d)M/);
  };

  const rules = computed(() => ({
    name: { required },
    theoreticalDuration: { hours: { required, validateISOHours }, minutes: { required, validateISOMinutes } },
  }));
  const v$ = useVuelidate(rules, editedStep);

  const openStepEditionModal = async (step) => {
    if (isLocked(step)) {
      openNextModalAfterUnlocking.value = () => openStepEditionModal(step);
      openValidateUnlockingEditionModal(step);
    } else {
      const { hours, minutes } = CompaniDuration(step.theoreticalDuration || 'PT0S').toHoursAndMinutesObject();
      editedStep.value = {
        ...pick(step, ['_id', 'name', 'type']),
        theoreticalDuration: { hours: `PT${hours}H`, minutes: `PT${minutes}M` },
      };
      stepEditionModal.value = true;
    }
  };

  const editStep = async () => {
    try {
      modalLoading.value = true;
      v$.value.$touch();
      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');
      const payload = { ...pick(editedStep.value, ['name']),
        theoreticalDuration: CompaniDuration(editedStep.value.theoreticalDuration.hours)
          .add(editedStep.value.theoreticalDuration.minutes).toISO() };
      await Steps.updateById(editedStep.value._id, payload);
      stepEditionModal.value = false;
      await refreshProgram();
      NotifyPositive('Étape modifiée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la modification de l\'étape.');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetStepEditionModal = () => {
    editedStep.value = { name: '', theoreticalDuration: { hours: 'PT0H', minutes: 'PT0M' } };
    v$.value.$reset();
  };

  const theoreticalHoursErrorMsg = computed(() => {
    if (!v$.value.theoreticalDuration.hours.required.$response) return REQUIRED_LABEL;
    if (!v$.value.theoreticalDuration.hours.validateISOHours.$response) return 'Durée non valide';

    return '';
  });

  const theoreticalMinutesErrorMsg = computed(() => {
    if (!v$.value.theoreticalDuration.minutes.required.$response) return REQUIRED_LABEL;
    if (!v$.value.theoreticalDuration.minutes.validateISOMinutes.$response) return 'Durée non valide';

    return '';
  });

  return {
    // Data
    editedStep,
    stepEditionModal,
    v$,
    // Methods
    openStepEditionModal,
    editStep,
    resetStepEditionModal,
    theoreticalHoursErrorMsg,
    theoreticalMinutesErrorMsg,
  };
};
