const { default: axios } = require('axios');
const ctx = require('../../../quasar.conf');

const parseEnv = env => Object.keys(env).reduce((acc, key) => {
  if (env[key]) acc[key] = env[key];
  return acc;
}, {});

module.exports = (on, config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-blink-features=RootLayerScrolling');
      return launchOptions;
    }
    return true;
  });

  on('task', {
    log (message) {
      // eslint-disable-next-line no-console
      console.warn(message);
      return null;
    },
    async seedPlanning () {
      await axios.get('http://localhost:3001/end-to-end/seed/planning');
      return null;
    },
    async seedBilling () {
      await axios.get('http://localhost:3001/end-to-end/seed/billing');
      return null;
    },
    async seedAuthentication () {
      await axios.get('http://localhost:3001/end-to-end/seed/authentication');
      return null;
    },
    async login (credentials) {
      const auth = await axios.post('http://localhost:3001/users/authenticate', credentials, { withCredentials: true });
      return auth.data.data;
    },
  });

  const { env } = ctx().build;
  config.env = { ...parseEnv(env) };

  return config;
};
