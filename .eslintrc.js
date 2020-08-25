module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: { browser: true },
  extends: [
    'airbnb-base',
    'plugin:cypress/recommended',
    'standard',
    'plugin:vue/strongly-recommended'
  ],
  plugins: ['vue', 'cypress'],
  globals: {
    '__statics': true,
    'cypress/globals': true
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'react/display-name': 'off',
    'max-len': ['error', { code: 120, tabWidth: 2 }],
    'no-console': ['error', { allow: ['error'] }],
    'no-trailing-spaces': 'error',
    'indent': ["error", 2, { SwitchCase: 1 }],
    'vue/max-attributes-per-line': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/html-indent': 0,
    'vue/html-closing-bracket-newline': 0,
    'arrow-parens': [2, 'as-needed', { requireForBlockBody: true }],
    // Un-used AirBnb rules
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': 0,
    'import/extensions': ['error', 'never'],
    'import/prefer-default-export': 0,
    'import/no-unresolved': 0,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    'consistent-return': 0,
    'func-names': 0,
    'global-require': 0,
    'no-plusplus': 0,
    'default-case': 0,
    'no-restricted-globals': 0,
    'no-await-in-loop': 0,
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'object-curly-newline': ['error', { consistent: true }],
    'operator-linebreak': ['error', 'before', { overrides: { '&&': 'after', '||': 'after', '=': 'after' } }],
  }
}
