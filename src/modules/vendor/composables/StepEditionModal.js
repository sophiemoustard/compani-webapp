import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import pick from 'lodash/pick';
import { getHoursAndMinutes, computeHours } from '@helpers/date';
import { integerNumber, positiveNumber } from '@helpers/vuelidateCustomVal';
import { E_LEARNING, REQUIRED_LABEL } from '@data/constants';
import { required, requiredIf, maxValue } from '@vuelidate/validators';
import Steps from '@api/Steps';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useStepEditionModal = (
  isLocked,
  openValidateUnlockingEditionModal,
  refreshProgram,
  modalLoading,
  openNextModalAfterUnlocking
) => {
  const editedStep = ref({ name: '', type: E_LEARNING, theoreticalHours: { hours: 0, minutes: 0 } });
  const stepEditionModal = ref(false);

  const rules = computed(() => ({
    name: { required },
    theoreticalHours: {
      hours: { required: requiredIf(!editedStep.value.theoreticalHours.minutes), integerNumber, positiveNumber },
      minutes: {
        required: requiredIf(!editedStep.value.theoreticalHours.hours),
        integerNumber,
        positiveNumber,
        maxValue: maxValue(59),
      },
    },
  }));
  const v$ = useVuelidate(rules, editedStep);

  const openStepEditionModal = async (step) => {
    if (isLocked(step)) {
      openNextModalAfterUnlocking.value = () => openStepEditionModal(step);
      openValidateUnlockingEditionModal(step);
    } else {
      editedStep.value = {
        ...pick(step, ['_id', 'name', 'type']),
        theoreticalHours: getHoursAndMinutes(step.theoreticalHours),
      };
      stepEditionModal.value = true;
    }
  };

  const editStep = async () => {
    try {
      modalLoading.value = true;
      v$.value.$touch();
      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');

      await Steps.updateById(
        editedStep.value._id,
        { ...pick(editedStep.value, ['name']), theoreticalHours: computeHours(editedStep.value.theoreticalHours) }
      );
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
    editedStep.value = { name: '', theoreticalHours: { hours: 0, minutes: 0 } };
    v$.value.$reset();
  };

  const theoreticalHoursErrorMsg = computed(() => {
    if (!v$.value.theoreticalHours.hours.required.$response) return REQUIRED_LABEL;
    if (!v$.value.theoreticalHours.hours.integerNumber.$response ||
      !v$.value.theoreticalHours.hours.positiveNumber.$response) return 'Durée non valide';

    return '';
  });

  const theoreticalMinutesErrorMsg = computed(() => {
    if (!v$.value.theoreticalHours.minutes.required.$response) return REQUIRED_LABEL;
    if (!v$.value.theoreticalHours.minutes.integerNumber.$response ||
     !v$.value.theoreticalHours.minutes.positiveNumber.$response ||
     !v$.value.theoreticalHours.minutes.maxValue.$response) return 'Durée non valide';

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
