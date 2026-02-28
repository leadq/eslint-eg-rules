import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';
import jsxEventHandlerNaming from './rules/jsx-event-handler-naming';
import functionsNaming from './rules/functions-naming';
import booleanPropNaming from './rules/boolean-prop-naming';
import testStatementMatch from './rules/test-statement-match';
import { reactComponentLayoutRule } from './rules/react-component-layout';

export const rules = {
  'api-type-suffix': apiTypeSuffix,
  'component-callback-naming': componentCallbackNaming,
  'jsx-event-handler-naming': jsxEventHandlerNaming,
  'functions-naming': functionsNaming,
  'boolean-prop-naming': booleanPropNaming,
  'test-statement-match': testStatementMatch,
  'react-component-layout': reactComponentLayoutRule,
};

export const configs = {
  recommended: {
    plugins: ['eg-rules'],
    rules: {
      'eg-rules/api-type-suffix': 'error',
      'eg-rules/component-callback-naming': 'error',
      'eg-rules/jsx-event-handler-naming': 'error',
      'eg-rules/functions-naming': 'error',
      'eg-rules/boolean-prop-naming': 'error',
      'eg-rules/test-statement-match': 'error',
      'eg-rules/react-component-layout': 'warn',
    },
  },
};
