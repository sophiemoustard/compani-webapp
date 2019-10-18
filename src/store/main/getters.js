export const user = (state) => {
  return state.user;
};
export const company = (state) => {
  return state.user ? state.user.company : {};
}
export const toggleDrawer = (state) => {
  return state.toggleDrawer;
};
