import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';

export const rules = {
  'api-type-suffix': apiTypeSuffix,
  'component-callback-naming': componentCallbackNaming,
};

export const configs = {
  recommended: {
    plugins: ['eg-rules'],
    rules: {
      'eg-rules/api-type-suffix': 'error',
      'eg-rules/component-callback-naming': 'error',
    },
  },
};
