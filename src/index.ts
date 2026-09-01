import apiTypeSuffix from './rules/api-type-suffix';
import componentCallbackNaming from './rules/component-callback-naming';
import jsxEventHandlerNaming from './rules/jsx-event-handler-naming';
import functionsNaming from './rules/functions-naming';
import booleanPropNaming from './rules/boolean-prop-naming';
import testStatementMatch from './rules/test-statement-match';
import { reactComponentLayoutRule } from './rules/react-component-layout';
import noTestAttrs from './rules/no-test-attrs';
import reactBemNaming from './rules/react-bem-naming';
import noUnusedDepsInHooks from './rules/no-unused-deps-in-hooks';
import utilHookSingleExport from './rules/util-hook-single-export';
import utilHookColocation from './rules/util-hook-colocation';
import reactComponentPropsNamingCheck from './rules/react-component-props-naming-check';
import reactExportSingleComponentCheck from './rules/react-export-single-component-check';

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
  'no-unused-deps-in-hooks': noUnusedDepsInHooks,
  'util-hook-single-export': utilHookSingleExport,
  'util-hook-colocation': utilHookColocation,
  'react-component-props-naming-check': reactComponentPropsNamingCheck,
  'react-export-single-component-check': reactExportSingleComponentCheck,
};

export const meta = {
  name: 'eslint-plugin-strict-eg-rulez',
  version: '3.0.0',
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
    'strict-eg-rulez/react-component-layout': 'error',
    'strict-eg-rulez/no-test-attrs': 'error',
    'strict-eg-rulez/react-bem-naming': 'error',
    'strict-eg-rulez/no-unused-deps-in-hooks': 'error',
    'strict-eg-rulez/util-hook-single-export': 'error',
    'strict-eg-rulez/util-hook-colocation': 'error',
    'strict-eg-rulez/react-component-props-naming-check': 'error',
    'strict-eg-rulez/react-export-single-component-check': 'error',
  },
};

export const configs = {
  recommended: legacyRecommended,
  'flat/recommended': {
    plugins: {
      'strict-eg-rulez': { meta, rules },
    },
    rules: legacyRecommended.rules,
  },
};
