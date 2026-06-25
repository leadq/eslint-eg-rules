import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'noTestAttr';
type Options = [{ attrs?: string[] }];

const defaultAttrs = ['data-testid', 'data-test', 'data-test-id', 'data-cy', 'data-e2e'];

function isTestFile(filename: string): boolean {
  return /\.(test|spec)\.[jt]sx?$/.test(filename) || /__tests__[\\/]/.test(filename);
}

function getAttrName(node: TSESTree.JSXAttribute): string | null {
  if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
    return node.name.name;
  }
  // e.g. data-testid is a JSXNamespacedName? No — JSX hyphenated attrs are JSXIdentifier in most parsers
  // But handle it just in case
  if (node.name.type === AST_NODE_TYPES.JSXNamespacedName) {
    return `${node.name.namespace.name}:${node.name.name.name}`;
  }
  return null;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow test-only attributes (e.g. data-testid, data-cy) in non-test source files. These attributes should only appear in test files or test mocks.',
    },
    messages: {
      noTestAttr:
        "Test attribute '{{attr}}' must not be used in non-test files. Add it only in test files or mocks.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          attrs: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            description: 'List of JSX attribute names that are considered test-only.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();

    // Skip enforcement in test / spec files entirely
    if (isTestFile(filename)) {
      return {};
    }

    const options = context.options[0] || {};
    const forbiddenAttrs: string[] =
      options.attrs && options.attrs.length > 0 ? options.attrs : defaultAttrs;

    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        const attrName = getAttrName(node);
        if (attrName && forbiddenAttrs.includes(attrName)) {
          context.report({
            node,
            messageId: 'noTestAttr',
            data: { attr: attrName },
          });
        }
      },
    };
  },
};

export default rule;
