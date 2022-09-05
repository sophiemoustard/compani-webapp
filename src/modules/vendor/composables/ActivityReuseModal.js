import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Steps from '@api/Steps';
import Programs from '@api/Programs';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useActivityReuseModal = (modalLoading, refreshProgram, currentStepId) => {
  const activityReuseModal = ref(false);
  const sameStepActivities = ref([]);
  const reusedActivity = ref('');
  const programOptions = ref([]);

  const rules = computed(() => ({ required }));
  const v$ = useVuelidate(rules, reusedActivity);

  const openActivityReuseModal = (step) => {
    currentStepId.value = step._id;
    sameStepActivities.value = step.activities.map(a => a._id);
    activityReuseModal.value = true;
  };

  const refreshProgramList = async () => {
    try {
      const programs = await Programs.list();

      programOptions.value = programs.map(p => ({ label: p.name, value: p._id }));
    } catch (e) {
      programOptions.value = [];
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des programmes.');
    }
  };

  const reuseActivity = async () => {
    try {
      modalLoading.value = true;

      v$.value.$touch();
      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');

      await Steps.reuseActivity(currentStepId.value, { activities: reusedActivity.value });
      activityReuseModal.value = false;
      await refreshProgram();
      NotifyPositive('Activité réutilisée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la réutilisation de l\'activité.');
    } finally {
      modalLoading.value = false;
    }
  };
  const duplicateActivity = async () => {
    try {
      modalLoading.value = true;

      v$.value.$touch();
      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');

      await Steps.addActivity(currentStepId.value, { activityId: reusedActivity.value });
      activityReuseModal.value = false;
      await refreshProgram();
      NotifyPositive('Activité dupliquée.');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la dupliquation de l\'activité.');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetActivityReuseModal = () => {
    reusedActivity.value = '';
    v$.value.$reset();
  };

  return {
    // DATA
    activityReuseModal,
    sameStepActivities,
    reusedActivity,
    programOptions,
    v$,
    // Methods
    openActivityReuseModal,
    refreshProgramList,
    reuseActivity,
    duplicateActivity,
    resetActivityReuseModal,
  };
};
