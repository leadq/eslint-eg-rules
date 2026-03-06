import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';
import jsxEventHandlerNaming from './rules/jsx-event-handler-naming';
import functionsNaming from './rules/functions-naming';
import booleanPropNaming from './rules/boolean-prop-naming';
import testStatementMatch from './rules/test-statement-match';
import { reactComponentLayoutRule } from './rules/react-component-layout';
import noTestAttrs from './rules/no-test-attrs';

export const rules = {
  'api-type-suffix': apiTypeSuffix,
  'component-callback-naming': componentCallbackNaming,
  'jsx-event-handler-naming': jsxEventHandlerNaming,
  'functions-naming': functionsNaming,
  'boolean-prop-naming': booleanPropNaming,
  'test-statement-match': testStatementMatch,
  'react-component-layout': reactComponentLayoutRule,
  'no-test-attrs': noTestAttrs,
};

const legacyRecommended = {
  plugins: ['eg-rules'],
  rules: {
    'eg-rules/api-type-suffix': 'error',
    'eg-rules/component-callback-naming': 'error',
    'eg-rules/jsx-event-handler-naming': 'error',
    'eg-rules/functions-naming': 'error',
    'eg-rules/boolean-prop-naming': 'error',
    'eg-rules/test-statement-match': 'error',
    'eg-rules/react-component-layout': 'warn',
    'eg-rules/no-test-attrs': 'error',
  },
};

const flatRecommended = {
  plugins: {
    'eg-rules': { rules },
  },
  rules: legacyRecommended.rules,
};

export const configs = {
  recommended: legacyRecommended,
  'flat/recommended': flatRecommended,
};
