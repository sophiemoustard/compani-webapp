const ctx = require('../../../quasar.conf');

const { env } = ctx().build;

const parseEnv = (env) => Object.keys(env).reduce((acc, key) => {
  if (env[key]) acc[key] = JSON.parse(env[key]);
  return acc;
}, {});

module.exports = (on, config) => {
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
