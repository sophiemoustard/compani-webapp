const ctx = require('../../../quasar.conf');

const { env } = ctx().build;

const parseEnv = (env) => Object.keys(env).reduce((acc, key) => {
  if (env[key]) {
    acc[key] = JSON.parse(env[key]);
  }
  return acc;
}, {});

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  // console.log(config); // see what all is in here!

  // Chrome:: Hack for shaking AUT. Cypress Issue: https://github.com/cypress-io/cypress/issues/1620
  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'chrome') {
      args.push('--disable-blink-features=RootLayerScrolling');
      return args;
    }
    return true;
  });

  on('task', {
    log (message) {
      console.warn(message);
      return null;
    },
  });

  config.env = { ...parseEnv(env) };

  return config;
};
