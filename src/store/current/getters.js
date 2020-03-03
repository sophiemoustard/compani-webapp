export const user = (state) => {
  return state.user;
};
export const company = (state) => {
  return state.user ? state.user.company : {};
}
