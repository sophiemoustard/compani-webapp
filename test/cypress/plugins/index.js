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
  });

  const { env } = ctx().build;
  config.env = { ...parseEnv(env) };

  return config;
};
