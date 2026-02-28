import globals from 'globals';
import tseslint from 'typescript-eslint';
import egRulesPlugin from 'eslint-plugin-eg-rules';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'eg-rules': egRulesPlugin,
    },
    rules: {
      'eg-rules/example-rule': 'error',
      'eg-rules/api-type-suffix': 'error',
    },
  }
);
