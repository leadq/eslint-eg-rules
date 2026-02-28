import exampleRule from './rules/example-rule';
import apiTypeSuffix from './rules/api-type-suffix';

export const rules = {
  'example-rule': exampleRule,
  'api-type-suffix': apiTypeSuffix,
};

export const configs = {
  recommended: {
    plugins: ['eg-rules'],
    rules: {
      'eg-rules/example-rule': 'error',
      'eg-rules/api-type-suffix': 'error',
    },
  },
};
