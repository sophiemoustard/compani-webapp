export const tableMixin = {
  methods: {
    getRowIndex (data, rowObj) {
      return data.indexOf(rowObj);
    },
  },
};
