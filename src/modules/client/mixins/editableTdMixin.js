export const editableTdMixin = {
  methods: {
    editField ({ obj, path, ref }) {
      obj[path] = true;
      this.$nextTick(() => {
        ref.focus();
      })
    },
    setEditionField ({ value, obj, path }) {
      obj[path] = !value || isNaN(value) ? 0 : value;
    },
    disableEditionField ({ obj, path }) {
      obj[path] = false;
    },
  },
};
