import get from 'lodash/get';
import { watch } from 'vue';

export const useValidations = () => {
  const waitForValidation = async (validationObj, path) => {
    if (path.match(/address/i)) return waitForFormValidation(get(validationObj, path));

    return !get(validationObj, path).$error;
  };
  const waitForFormValidation = async validationObj => new Promise((resolve) => {
    const unwatch = watch(
      () => !validationObj.$pending,
      (notPending) => {
        if (notPending) {
          if (unwatch) unwatch();
          resolve(!validationObj.$error);
        }
      },
      { immediate: true }
    );
  });
  return {
    // Methods
    waitForValidation,
    waitForFormValidation,
  };
};
