import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';
import jsxEventHandlerNaming from './rules/jsx-event-handler-naming';
import functionsNaming from './rules/functions-naming';
import booleanPropNaming from './rules/boolean-prop-naming';
import testStatementMatch from './rules/test-statement-match';
import { reactComponentLayoutRule } from './rules/react-component-layout';
import noTestAttrs from './rules/no-test-attrs';
import reactBemNaming from './rules/react-bem-naming';

export const rules = {
  'api-type-suffix': apiTypeSuffix,
  'component-callback-naming': componentCallbackNaming,
  'jsx-event-handler-naming': jsxEventHandlerNaming,
  'functions-naming': functionsNaming,
  'boolean-prop-naming': booleanPropNaming,
  'test-statement-match': testStatementMatch,
  'react-component-layout': reactComponentLayoutRule,
  'no-test-attrs': noTestAttrs,
  'react-bem-naming': reactBemNaming,
};

const legacyRecommended = {
  plugins: ['strict-eg-rulez'],
  rules: {
    'strict-eg-rulez/api-type-suffix': 'error',
    'strict-eg-rulez/component-callback-naming': 'error',
    'strict-eg-rulez/jsx-event-handler-naming': 'error',
    'strict-eg-rulez/functions-naming': 'error',
    'strict-eg-rulez/boolean-prop-naming': 'error',
    'strict-eg-rulez/test-statement-match': 'error',
    'strict-eg-rulez/react-component-layout': 'warn',
    'strict-eg-rulez/no-test-attrs': 'error',
    'strict-eg-rulez/react-bem-naming': 'error',
  },
};

export const configs = {
  recommended: legacyRecommended,
};
