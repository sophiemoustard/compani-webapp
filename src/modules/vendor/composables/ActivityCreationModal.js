import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Steps from '@api/Steps';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useActivityCreationModal = (modalLoading, refreshProgram, currentStepId) => {
  const newActivity = ref({ name: '' });
  const activityCreationModal = ref(false);

  const rules = computed(() => ({ name: { required }, type: { required } }));
  const v$ = useVuelidate(rules, newActivity);

  const openActivityCreationModal = (stepId) => {
    activityCreationModal.value = true;
    currentStepId.value = stepId;
  };

  const createActivity = async () => {
    try {
      modalLoading.value = true;
      v$.value.$touch();
      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');
      await Steps.addActivity(currentStepId.value, newActivity.value);
      NotifyPositive('Activité créée.');

      await refreshProgram();
      activityCreationModal.value = false;
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la création de l\'activité.');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetActivityCreationModal = () => {
    newActivity.value = { name: '', type: '' };
    v$.value.$reset();
  };

  return {
    // DATA
    newActivity,
    activityCreationModal,
    v$,
    // Methods
    openActivityCreationModal,
    createActivity,
    resetActivityCreationModal,
  };
};
