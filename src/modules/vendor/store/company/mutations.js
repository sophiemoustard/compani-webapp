export function saveCompany (state, data) {
  state.company = !data ? data : Object.assign({}, data);
};
