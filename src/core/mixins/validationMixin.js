import get from 'lodash/get';

export const validationMixin = {
  methods: {
    async waitForValidation (validationObj, path) {
      if (path.match(/address/i)) return this.waitForFormValidation(get(validationObj, path));

      return !get(validationObj, path).$error;
    },
    async waitForFormValidation (validationObj) {
      return new Promise((resolve) => {
        const unwatch = this.$watch(
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
    },
  },
};
