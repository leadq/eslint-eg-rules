import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  isPascalCase,
  isReactHook,
  isJSXNode,
  unwrapExpression,
  matchesIgnorePattern,
} from '../../utils/ast-helpers';

type MessageIds = 'missingRenderPrefix' | 'missingBooleanPrefix' | 'missingValuePrefix';

export interface FunctionsNamingOptions {
  booleanPrefixes?: string[];
  valuePrefixes?: string[];
  jsxPrefixes?: string[];
  ignoreNames?: string[];
  ignorePatterns?: string[];
}

type Options = [FunctionsNamingOptions?];

const DEFAULT_OPTIONS: Required<FunctionsNamingOptions> = {
  booleanPrefixes: ['is', 'has', 'will', 'can', 'should', 'did'],
  valuePrefixes: ['calculate', 'get', 'determine'],
  jsxPrefixes: ['render'],
  ignoreNames: [],
  ignorePatterns: ['**/*.test.*', '**/*.spec.*'],
};

function hasPrefix(name: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) =>
      name === prefix ||
      (name.startsWith(prefix) && name[prefix.length] === name[prefix.length].toUpperCase())
  );
}

function getFunctionName(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): string | null {
  if (node.type === AST_NODE_TYPES.FunctionDeclaration && node.id) {
    return node.id.name;
  }
  if (
    (node.type === AST_NODE_TYPES.FunctionExpression ||
      node.type === AST_NODE_TYPES.ArrowFunctionExpression) &&
    node.parent
  ) {
    if (
      node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
      node.parent.id.type === AST_NODE_TYPES.Identifier
    ) {
      return node.parent.id.name;
    }
    if (
      node.parent.type === AST_NODE_TYPES.Property &&
      node.parent.key.type === AST_NODE_TYPES.Identifier
    ) {
      return node.parent.key.name;
    }
    if (
      node.parent.type === AST_NODE_TYPES.MethodDefinition &&
      node.parent.key.type === AST_NODE_TYPES.Identifier
    ) {
      return node.parent.key.name;
    }
  }
  return null;
}

function shouldIgnore(name: string, ignoreNames: string[]): boolean {
  if (ignoreNames.includes(name)) return true;
  // Ignore React Components (Capitalized / PascalCase)
  if (isPascalCase(name)) return true;
  // Ignore Hooks
  if (isReactHook(name)) return true;
  // Ignore Event Handlers
  if (/^on[A-Z]/.test(name) || /^handle[A-Z]/.test(name)) return true;
  // Ignore standard lifecycle/test/native methods
  if (
    [
      'toString',
      'valueOf',
      'toJSON',
      'render',
      'constructor',
      'componentDidMount',
      'componentDidUpdate',
      'componentWillUnmount',
    ].includes(name)
  ) {
    return true;
  }
  return false;
}

type ReturnNature = 'jsx' | 'boolean' | 'value' | 'unknown';

function getExpressionNature(node: TSESTree.Node | null | undefined): ReturnNature {
  if (!node) return 'unknown';
  const unwrapped = unwrapExpression(node);
  if (!unwrapped) return 'unknown';

  if (isJSXNode(unwrapped)) {
    return 'jsx';
  }

  // Literals
  if (unwrapped.type === AST_NODE_TYPES.Literal) {
    if (typeof (unwrapped as TSESTree.Literal).value === 'boolean') return 'boolean';
    if (typeof (unwrapped as TSESTree.Literal).value === 'string') return 'value';
    if (typeof (unwrapped as TSESTree.Literal).value === 'number') return 'value';
  }

  // Template Literals (string)
  if (unwrapped.type === AST_NODE_TYPES.TemplateLiteral) {
    return 'value';
  }

  // Array / Object Expressions
  if (
    unwrapped.type === AST_NODE_TYPES.ArrayExpression ||
    unwrapped.type === AST_NODE_TYPES.ObjectExpression
  ) {
    return 'value';
  }

  // Logical Expressions
  if (unwrapped.type === AST_NODE_TYPES.LogicalExpression) {
    const leftNature = getExpressionNature(unwrapped.left);
    const rightNature = getExpressionNature(unwrapped.right);
    if (leftNature === 'jsx' || rightNature === 'jsx') return 'jsx';
    if (leftNature === 'boolean' || rightNature === 'boolean') return 'boolean';
    if (leftNature === 'value' || rightNature === 'value') return 'value';
  }

  // Conditional Expression
  if (unwrapped.type === AST_NODE_TYPES.ConditionalExpression) {
    const consNature = getExpressionNature(unwrapped.consequent);
    const altNature = getExpressionNature(unwrapped.alternate);
    if (consNature === 'jsx' || altNature === 'jsx') return 'jsx';
    if (consNature === 'boolean' || altNature === 'boolean') return 'boolean';
    if (consNature === 'value' || altNature === 'value') return 'value';
  }

  // Binary Expression (comparisons are boolean, math/string operations are value)
  if (unwrapped.type === AST_NODE_TYPES.BinaryExpression) {
    if (
      ['===', '!==', '==', '!=', '>', '<', '>=', '<=', 'instanceof', 'in'].includes(
        unwrapped.operator
      )
    ) {
      return 'boolean';
    }
    return 'value';
  }

  // Unary Expression
  if (unwrapped.type === AST_NODE_TYPES.UnaryExpression) {
    if (unwrapped.operator === '!') return 'boolean';
    if (['+', '-', '~', 'typeof'].includes(unwrapped.operator)) return 'value';
  }

  return 'unknown';
}

function getReturnNature(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): ReturnNature {
  if (node.returnType?.typeAnnotation) {
    const typeNode = node.returnType.typeAnnotation;
    if (
      typeNode.type === AST_NODE_TYPES.TSBooleanKeyword ||
      (typeNode.type === AST_NODE_TYPES.TSTypeReference &&
        (typeNode.typeName as any).name === 'boolean')
    ) {
      return 'boolean';
    }
    if (
      typeNode.type === AST_NODE_TYPES.TSStringKeyword ||
      typeNode.type === AST_NODE_TYPES.TSNumberKeyword ||
      typeNode.type === AST_NODE_TYPES.TSObjectKeyword ||
      typeNode.type === AST_NODE_TYPES.TSArrayType ||
      typeNode.type === AST_NODE_TYPES.TSTupleType ||
      typeNode.type === AST_NODE_TYPES.TSTypeLiteral
    ) {
      return 'value';
    }
    if (
      typeNode.type === AST_NODE_TYPES.TSTypeReference &&
      ['ReactNode', 'JSX.Element', 'ReactElement'].includes((typeNode.typeName as any).name)
    ) {
      return 'jsx';
    }
  }

  if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
    return getExpressionNature(node.body);
  }

  const returns: TSESTree.Node[] = [];
  function findReturns(current: TSESTree.Node) {
    if (
      current !== node &&
      (current.type === AST_NODE_TYPES.FunctionDeclaration ||
        current.type === AST_NODE_TYPES.FunctionExpression ||
        current.type === AST_NODE_TYPES.ArrowFunctionExpression)
    ) {
      return;
    }

    if (current.type === AST_NODE_TYPES.ReturnStatement && current.argument) {
      returns.push(current.argument);
    }

    for (const key of Object.keys(current)) {
      if (key === 'parent') continue;
      const child = (current as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach((c) => c && typeof c === 'object' && findReturns(c));
        } else if (child.type) {
          findReturns(child);
        }
      }
    }
  }

  findReturns(node.body);

  for (const ret of returns) {
    const nature = getExpressionNature(ret);
    if (nature !== 'unknown') return nature;
  }

  return 'unknown';
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces function prefixes based on their return types (e.g. render for JSX, is/has for booleans, get/calculate for values).',
      recommended: true,
    } as any,
    schema: [
      {
        type: 'object',
        properties: {
          booleanPrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          valuePrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          jsxPrefixes: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreNames: {
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
    messages: {
      missingRenderPrefix:
        'Functions returning JSX should be prefixed with "render" (e.g., renderComponent).',
      missingBooleanPrefix:
        'Functions returning booleans should be prefixed with a boolean word like "is", "has", "can", "will".',
      missingValuePrefix:
        'Functions returning objects, arrays, numbers, or strings should be prefixed with "get", "calculate", or "determine".',
    },
  },
  defaultOptions: [{}],
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<FunctionsNamingOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      if (matchesIgnorePattern(filename, options.ignorePatterns)) {
        return {};
      }
    }

    function processFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
    ) {
      const name = getFunctionName(node);
      if (!name) return;

      if (shouldIgnore(name, options.ignoreNames)) return;

      const nature = getReturnNature(node);

      if (nature === 'jsx' && !hasPrefix(name, options.jsxPrefixes)) {
        context.report({
          node,
          messageId: 'missingRenderPrefix',
        });
      } else if (nature === 'boolean' && !hasPrefix(name, options.booleanPrefixes)) {
        context.report({
          node,
          messageId: 'missingBooleanPrefix',
        });
      } else if (nature === 'value' && !hasPrefix(name, options.valuePrefixes)) {
        context.report({
          node,
          messageId: 'missingValuePrefix',
        });
      }
    }

    return {
      FunctionDeclaration: processFunction,
      FunctionExpression: processFunction,
      ArrowFunctionExpression: processFunction,
    };
  },
};

export default rule;
