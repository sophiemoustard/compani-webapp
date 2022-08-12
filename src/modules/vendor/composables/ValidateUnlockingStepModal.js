import { ref } from 'vue';
import pick from 'lodash/pick';
import groupBy from 'lodash/groupBy';
import { sortStrings } from '@helpers/utils';
import { NotifyPositive } from '@components/popup/notify';

export const useValidateUnlockingStepModal = (openNextModalAfterUnlocking, setStepLocking, isLocked) => {
  const stepToBeUnlocked = ref({ _id: '', status: '' });
  const subProgramsReusingStepToBeUnlocked = ref([]);
  const validateUnlockingEditionModal = ref(false);

  const getSubProgramsReusingStep = step => Object.values(groupBy(step.subPrograms, 'program._id'))
    .map(groupSp => ({
      programName: groupSp[0].program.name,
      subProgramsName: groupSp.map(sP => sP.name).sort(sortStrings),
    }))
    .sort((a, b) => sortStrings(a.programName, b.programName));

  const confirmUnlocking = () => {
    setStepLocking(stepToBeUnlocked.value, false);
    openNextModalAfterUnlocking.value();
    validateUnlockingEditionModal.value = false;
    NotifyPositive('Étape déverrouillée.');
  };

  const cancelUnlocking = () => {
    validateUnlockingEditionModal.value = false;
    NotifyPositive('Déverrouillage annulé.');
  };

  const openValidateUnlockingEditionModal = (step) => {
    if (!isLocked(step)) return;

    stepToBeUnlocked.value = pick(step, ['_id', 'status']);
    subProgramsReusingStepToBeUnlocked.value = getSubProgramsReusingStep(step);
    validateUnlockingEditionModal.value = true;
  };

  const resetValidateUnlockingEditionModal = () => {
    openNextModalAfterUnlocking.value = () => null;
    stepToBeUnlocked.value = { _id: '', status: '' };
    subProgramsReusingStepToBeUnlocked.value = [];
  };

  return {
    // DATA
    stepToBeUnlocked,
    subProgramsReusingStepToBeUnlocked,
    validateUnlockingEditionModal,
    // Methods
    resetValidateUnlockingEditionModal,
    openValidateUnlockingEditionModal,
    confirmUnlocking,
    cancelUnlocking,
  };
};
