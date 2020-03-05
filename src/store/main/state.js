import { Platform } from 'quasar';

export default {
  loggedUser: null,
  refreshState: true,
  toggleDrawer: !!Platform.is.desktop,
};
