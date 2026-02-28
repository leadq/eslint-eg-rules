import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'missingPrefix';
type Options = [{ prefixes?: string[] }];

const defaultPrefixes = ['is', 'has', 'can', 'should', 'will', 'did', 'show', 'hide'];

function hasBooleanPrefix(name: string, prefixes: string[]): boolean {
  // Allow "is", "isReady" but not "isolate" where the next character is not capitalized.
  return prefixes.some(
    (prefix) =>
      name === prefix ||
      (name.startsWith(prefix) &&
        name.length > prefix.length &&
        name[prefix.length] === name[prefix.length].toUpperCase())
  );
}

function isBooleanType(typeNode: TSESTree.TypeNode): boolean {
  if (typeNode.type === AST_NODE_TYPES.TSBooleanKeyword) return true;
  if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
    // True if at least one boolean type exists, and all types are boolean or nullable/optional
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
    },
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
            minItems: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const isTargetFolder = /[\/\\](components|hooks|utils)[\/\\]/i.test(filename);

    // Only apply in target folders
    if (!isTargetFolder) {
      return {};
    }

    const options = context.options[0] || {};
    const prefixes =
      options.prefixes && options.prefixes.length > 0 ? options.prefixes : defaultPrefixes;

    function checkName(node: TSESTree.Node, name: string) {
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
