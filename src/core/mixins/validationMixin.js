import get from 'lodash/get';

export const validationMixin = {
  methods: {
    waitForValidation (validationObj, path) {
      return new Promise((resolve) => {
        if (path.match(/address/i)) {
          const unwatch = this.$watch(() => !get(validationObj, path).$pending, (notPending) => {
            if (notPending) {
              if (unwatch) unwatch();
              resolve(!get(validationObj, path).$error);
            }
          }, { immediate: true });
        } else {
          resolve(!get(validationObj, path).$error);
        }
      });
    },
    waitForFormValidation (validationObj) {
      // eslint-disable-next-line no-console
      console.log('toto', validationObj);
      return new Promise((resolve) => {
        const unwatch = this.$watch(() => !validationObj.$pending, (notPending) => {
          if (notPending) {
            if (unwatch) unwatch();
            validationObj.$touch();
            resolve(!validationObj.$error);
          }
        }, { immediate: true });
      });
    },
  },
};
