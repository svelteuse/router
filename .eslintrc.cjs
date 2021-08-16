module.exports = {
  plugins: ['import', 'unicorn', 'regexp', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:unicorn/recommended',
    'plugin:regexp/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // import
    'import/no-unresolved': 'off',

    // unicorns
    // addtional
    'unicorn/custom-error-definition': 'off',
    'unicorn/import-index': 'off',
    'unicorn/no-keyword-prefix': 'off',
    'unicorn/no-unsafe-regex': 'warn',
    'unicorn/no-unused-properties': 'off',
    'unicorn/prefer-at': ['off', { checkAllIndexAccess: true }],
    'unicorn/prefer-object-has-own': 'warn',
    'unicorn/prefer-string-replace-all': 'warn',
    'unicorn/prefer-top-level-await': 'off',
    // overrides
    'unicorn/prevent-abbreviations': 'off',
  },
}
