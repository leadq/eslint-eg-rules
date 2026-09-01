module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['strict-eg-rulez'],
  rules: {
    'strict-eg-rulez/api-type-suffix': 'error',
    'strict-eg-rulez/component-callback-naming': 'error',
    'strict-eg-rulez/jsx-event-handler-naming': 'error',
    'strict-eg-rulez/functions-naming': 'error',
    'strict-eg-rulez/boolean-prop-naming': 'error',
    'strict-eg-rulez/test-statement-match': 'error',
    'strict-eg-rulez/react-component-layout': 'error',
    'strict-eg-rulez/no-test-attrs': 'error',
    'strict-eg-rulez/util-hook-single-export': 'error',
    'strict-eg-rulez/util-hook-colocation': 'error',
    'strict-eg-rulez/react-component-props-naming-check': 'error',
    'strict-eg-rulez/react-export-single-component-check': 'error',
  },
  overrides: [
    {
      files: ['src/components/react-bem-naming/kebab-case/**/*.tsx'],
      rules: {
        'strict-eg-rulez/react-bem-naming': ['error', { mode: 'kebab-case' }],
      },
    },
    {
      files: ['src/components/react-bem-naming/camelCase/**/*.tsx'],
      rules: {
        'strict-eg-rulez/react-bem-naming': ['error', { mode: 'camelCase' }],
      },
    },
    {
      files: ['src/components/react-bem-naming/strict/**/*.tsx'],
      rules: {
        'strict-eg-rulez/react-bem-naming': ['error', { mode: 'strict' }],
      },
    },
  ],
};
