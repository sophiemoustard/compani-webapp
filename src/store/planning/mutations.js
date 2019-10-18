export const setFilters = (state, filterData) => {
  state.filters = filterData;
}

export const setElementToAdd = (state, elem) => {
  state.elementToAdd = { ...elem };
}

export const setElementToRemove = (state, elem) => {
  state.elementToRemove = { ...elem };
}
