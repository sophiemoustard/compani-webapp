const ctx = require('../../../quasar.conf');

const { env } = ctx().build;

const parseEnv = (env) => Object.keys(env).reduce((acc, key) => {
  if (env[key]) acc[key] = JSON.parse(env[key]);
  return acc;
}, {});

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome') {
      launchOptions.args.push('--disable-blink-features=RootLayerScrolling');
      return launchOptions;
    }
    return launchOptions;
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
