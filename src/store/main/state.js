import { Platform } from 'quasar';

export default {
  user: null,
  refreshState: true,
  toggleDrawer: !!Platform.is.desktop,
};
