export const validationMixin = {
  methods: {
    waitForValidation (validationObj, path) {
      return new Promise((resolve) => {
        if (path.match(/address/i)) {
          const unwatch = this.$watch(() => !this.$_.get(validationObj, path).$pending, (notPending) => {
            if (notPending) {
              if (unwatch) {
                unwatch();
              }
              resolve(!this.$_.get(validationObj, path).$error);
            }
          }, { immediate: true });
        } else {
          resolve(!this.$_.get(validationObj, path).$error);
        }
      });
    },
    waitForFormValidation (validationObj) {
      return new Promise((resolve) => {
        const unwatch = this.$watch(() => !validationObj.$pending, (notPending) => {
          if (notPending) {
            if (unwatch) {
              unwatch();
            }
            validationObj.$touch();
            resolve(!validationObj.$error);
          }
        }, { immediate: true });
      })
    },
  },
}
