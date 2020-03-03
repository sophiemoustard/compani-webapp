module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  extends: [
    'plugin:vue/essential',
    'plugin:cypress/recommended',
    'standard'
  ],
  plugins: [
    'vue',
    'cypress'
  ],
  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true,
    'cypress/globals': true
  },
  rules: {
    'no-param-reassign': 'off',
    'import/first': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'prefer-promise-reject-errors': 'off',
    'generator-star-spacing': 'off',
    'arrow-parens': 0,
    'one-var': 0,
    'import/first': 0,
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'func-names': 0,
    'semi': 0,
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'never',
    }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console': ['error', { allow: ['warn', 'error']}],
  }
}
