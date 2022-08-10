import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Programs from '@api/Programs';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export const useSubProgramCreationModal = (profileId, modalLoading, refreshProgram) => {
  const newSubProgram = ref({ name: '' });
  const subProgramCreationModal = ref(false);

  const rules = computed(() => ({ name: { required } }));
  const v$ = useVuelidate(rules, newSubProgram);

  const createSubProgram = async () => {
    try {
      modalLoading.value = true;
      v$.value.$touch();

      if (v$.value.$error) return NotifyWarning('Champ(s) invalide(s)');
      await Programs.addSubProgram(profileId.value, newSubProgram.value);
      NotifyPositive('Sous-programme créé.');

      await refreshProgram();
      subProgramCreationModal.value = false;
    } catch (e) {
      console.error(e);

      NotifyNegative('Erreur lors de la création du sous-programme.');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetSubProgramCreationModal = () => {
    subProgramCreationModal.value = false;
    newSubProgram.value.name = '';
    v$.value.$reset();
  };

  return {
    newSubProgram,
    subProgramCreationModal,
    v$,
    // Methods
    createSubProgram,
    resetSubProgramCreationModal,
  };
};
