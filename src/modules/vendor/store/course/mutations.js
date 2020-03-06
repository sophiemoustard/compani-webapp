export function saveCourse (state, data) {
  state.course = !data ? data : Object.assign({}, data);
};
