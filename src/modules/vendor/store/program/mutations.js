export function saveProgram (state, data) {
  state.program = !data ? data : Object.assign({}, data);
};
