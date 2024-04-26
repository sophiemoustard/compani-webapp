import { boot } from 'quasar/wrappers';

export default boot(async ({ app }) => {
  app.config.performance = false;
});
