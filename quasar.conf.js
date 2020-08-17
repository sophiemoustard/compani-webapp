require('dotenv').config();
const path = require('path');
const webpack = require('webpack');

module.exports = function (ctx) {
  return {
    boot: [
      'axios',
      'alenviAxios',
      'moment',
      'vue-croppa',
      'vuelidate',
      'vueclipboard',
      process.env.NODE_ENV === 'production' ? 'vue-analytics' : null,
    ],
    css: [
      'app.styl',
    ],
    extras: [
      'material-icons',
      'mdi-v3',
      'ionicons-v4',
      'fontawesome-v5',
    ],
    framework: {
      all: false,
      lang: 'fr',
      components: [
        'QAjaxBar',
        'QBanner',
        'QBtn',
        'QBtnToggle',
        'QCard',
        'QCardActions',
        'QCardSection',
        'QCheckbox',
        'QChip',
        'QCircularProgress',
        'QDate',
        'QDialog',
        'QDrawer',
        'QExpansionItem',
        'QField',
        'QHeader',
        'QIcon',
        'QInfiniteScroll',
        'QInnerLoading',
        'QInput',
        'QItem',
        'QItemLabel',
        'QItemSection',
        'QLayout',
        'QLinearProgress',
        'QList',
        'QMenu',
        'QOptionGroup',
        'QPage',
        'QPageContainer',
        'QPageSticky',
        'QPopupProxy',
        'QScrollArea',
        'QSelect',
        'QSeparator',
        'QSlideTransition',
        'QSpinner',
        'QSpinnerDots',
        'QSpinnerFacebook',
        'QStepper',
        'QStep',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QTable',
        'QTab',
        'QTabPanel',
        'QTabPanels',
        'QTabs',
        'QTd',
        'QTh',
        'QTime',
        'QTr',
        'QToggle',
        'QToolbar',
        'QToolbarTitle',
        'QUploader',
      ],
      directives: [
        'Ripple',
        'ClosePopup',
      ],
      plugins: [
        'Notify',
        'Cookies',
        'Loading',
        'Dialog',
        'LocalStorage',
      ],
    },
    animations: [
      'fadeIn',
      'fadeOut',
    ],
    supportIE: true,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      publicPath: '/',
      gzip: true,
      useNotifier: false,
      preloadChunks: true,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/,
          options: {
            fix: true,
          },
        }, {
          test: /\.(html)$/,
          use: { loader: 'html-loader' },
        });
        // eslint-disable-next-line no-param-reassign
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '@components': path.resolve(__dirname, './src/core/components'),
          '@api': path.resolve(__dirname, './src/core/api'),
          '@helpers': path.resolve(__dirname, './src/core/helpers'),
          '@data': path.resolve(__dirname, './src/core/data'),
          '@mixins': path.resolve(__dirname, './src/core/mixins'),
        };
        cfg.plugins.push(
          // Select moment locale files
          new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr/),
          // Ignore astronomia (date-holidays)
          new webpack.IgnorePlugin(/^\.\/vsop87B.*$/)
        );
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        API_HOSTNAME: process.env.NODE_ENV === 'test' ? process.env.TEST_API_HOSTNAME : process.env.API_HOSTNAME,
        COMPANI_HOSTNAME: process.env.COMPANI_HOSTNAME,
        MESSENGER_LINK: process.env.MESSENGER_LINK,
        ENTERCODE_LINK: process.env.ENTERCODE_LINK,
        TOKEN_SECRET: process.env.TOKEN_SECRET,
        ALENVI_BOT_ID: process.env.ALENVI_BOT_ID,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        GA_TRACKING_ID: process.env.GA_TRACKING_ID,
      },
    },
    devServer: {
      open: true,
    },
    ssr: {
      pwa: false,
    },
    pwa: {
      manifest: {
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    cordova: {},
    electron: {
      extendWebpack (cfg) {},
      packager: {},
      builder: {},
    },
  };
};
