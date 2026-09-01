import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import { matchesIgnorePattern } from '../../utils/ast-helpers';

type MessageIds = 'missingPrefix';

export interface BooleanPropNamingOptions {
  prefixes?: string[];
  allowedPrefixes?: string[];
  ignoreProps?: string[];
  ignorePatterns?: string[];
}

type Options = [BooleanPropNamingOptions?];

const defaultPrefixes = [
  'is',
  'are',
  'has',
  'have',
  'can',
  'should',
  'will',
  'did',
  'do',
  'does',
];

const defaultIgnoreProps = [
  'disabled',
  'required',
  'checked',
  'readOnly',
  'autoFocus',
  'open',
  'hidden',
  'draggable',
  'autoPlay',
  'controls',
  'loop',
  'muted',
  'multiple',
  'selected',
];

function hasBooleanPrefix(name: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) =>
      name === prefix ||
      (name.startsWith(prefix) &&
        name.length > prefix.length &&
        name[prefix.length] === name[prefix.length].toUpperCase())
  );
}

function isBooleanType(typeNode: TSESTree.TypeNode | undefined): boolean {
  if (!typeNode) return false;
  if (typeNode.type === AST_NODE_TYPES.TSBooleanKeyword) return true;
  if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
    const hasBoolean = typeNode.types.some(
      (t) =>
        t.type === AST_NODE_TYPES.TSBooleanKeyword ||
        (t.type === AST_NODE_TYPES.TSLiteralType &&
          t.literal.type === AST_NODE_TYPES.Literal &&
          typeof t.literal.value === 'boolean')
    );
    if (!hasBoolean) return false;

    return typeNode.types.every(
      (t) =>
        t.type === AST_NODE_TYPES.TSBooleanKeyword ||
        t.type === AST_NODE_TYPES.TSNullKeyword ||
        t.type === AST_NODE_TYPES.TSUndefinedKeyword ||
        (t.type === AST_NODE_TYPES.TSLiteralType &&
          t.literal.type === AST_NODE_TYPES.Literal &&
          typeof t.literal.value === 'boolean')
    );
  }
  if (
    typeNode.type === AST_NODE_TYPES.TSLiteralType &&
    typeNode.literal.type === AST_NODE_TYPES.Literal &&
    typeof typeNode.literal.value === 'boolean'
  ) {
    return true;
  }
  return false;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce boolean prefix (is, has, can, etc.) for boolean props in components, hooks, and utils',
      recommended: true,
    } as any,
    messages: {
      missingPrefix:
        "Boolean property/parameter '{{name}}' should be prefixed with one of: {{prefixes}}.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          prefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          allowedPrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreProps: {
            type: 'array',
            items: { type: 'string' },
          },
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const isTargetFolder = /[\/\\](components|hooks|utils)[\/\\]/i.test(filename);

    if (!isTargetFolder) {
      return {};
    }

    const options = context.options[0] || {};
    const ignorePatterns = options.ignorePatterns || ['**/*.test.*', '**/*.spec.*'];
    if (matchesIgnorePattern(filename, ignorePatterns)) {
      return {};
    }

    const prefixes =
      options.allowedPrefixes && options.allowedPrefixes.length > 0
        ? options.allowedPrefixes
        : options.prefixes && options.prefixes.length > 0
        ? options.prefixes
        : defaultPrefixes;

    const ignoreProps = options.ignoreProps || defaultIgnoreProps;

    function checkName(node: TSESTree.Node, name: string) {
      if (ignoreProps.includes(name)) {
        return;
      }

      if (!hasBooleanPrefix(name, prefixes)) {
        context.report({
          node,
          messageId: 'missingPrefix',
          data: {
            name,
            prefixes: prefixes.join(', '),
          },
        });
      }
    }

    function checkParam(node: TSESTree.Parameter | TSESTree.Expression) {
      if (node.type === AST_NODE_TYPES.Identifier) {
        if (node.typeAnnotation && isBooleanType(node.typeAnnotation.typeAnnotation)) {
          checkName(node, node.name);
        }
      } else if (node.type === AST_NODE_TYPES.AssignmentPattern) {
        if (node.left.type === AST_NODE_TYPES.Identifier) {
          let isBool = false;
          if (node.left.typeAnnotation) {
            isBool = isBooleanType(node.left.typeAnnotation.typeAnnotation);
          } else if (
            node.right.type === AST_NODE_TYPES.Literal &&
            typeof node.right.value === 'boolean'
          ) {
            isBool = true;
          }
          if (isBool) {
            checkName(node.left, node.left.name);
          }
        }
      }
    }

    function processFunctions(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
    ) {
      node.params.forEach((param) => checkParam(param));
    }

    return {
      TSPropertySignature(node) {
        if (!node.typeAnnotation) return;
        if (isBooleanType(node.typeAnnotation.typeAnnotation)) {
          if (node.key.type === AST_NODE_TYPES.Identifier) {
            checkName(node.key, node.key.name);
          }
        }
      },

      PropertyDefinition(node) {
        if (!node.typeAnnotation && !node.value) return;
        let isBool = false;
        if (node.typeAnnotation) {
          isBool = isBooleanType(node.typeAnnotation.typeAnnotation);
        } else if (
          node.value &&
          node.value.type === AST_NODE_TYPES.Literal &&
          typeof node.value.value === 'boolean'
        ) {
          isBool = true;
        }

        if (isBool && node.key.type === AST_NODE_TYPES.Identifier) {
          checkName(node.key, node.key.name);
        }
      },

      FunctionDeclaration: processFunctions,
      FunctionExpression: processFunctions,
      ArrowFunctionExpression: processFunctions,
    };
  },
};

export default rule;
