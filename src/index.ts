import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';
import jsxEventHandlerNaming from './rules/jsx-event-handler-naming';
import functionsNaming from './rules/functions-naming';

export const rules = {
  'api-type-suffix': apiTypeSuffix,
  'component-callback-naming': componentCallbackNaming,
  'jsx-event-handler-naming': jsxEventHandlerNaming,
  'functions-naming': functionsNaming,
};

export const configs = {
  recommended: {
    plugins: ['eg-rules'],
    rules: {
      'eg-rules/api-type-suffix': 'error',
      'eg-rules/component-callback-naming': 'error',
      'eg-rules/jsx-event-handler-naming': 'error',
      'eg-rules/functions-naming': 'error',
    },
  },
};
