import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'missingRenderPrefix' | 'missingBooleanPrefix' | 'missingValuePrefix';
type Options = [];

const jsxPrefixes = ['render'];
const booleanPrefixes = ['is', 'has', 'will', 'can'];
const valuePrefixes = ['calculate', 'get', 'determine'];

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

function shouldIgnore(name: string): boolean {
  // Ignore React Components (Capitalized)
  if (/^[A-Z]/.test(name)) return true;
  // Ignore Hooks
  if (/^use[A-Z]/.test(name) || name === 'use') return true;
  // Ignore Event Handlers
  if (/^(on|handle)[A-Z]/.test(name) || name === 'on' || name === 'handle') return true;

  return false;
}

function findReturns(node: TSESTree.Node): TSESTree.Expression[] {
  const returns: TSESTree.Expression[] = [];

  function traverse(n: any) {
    if (!n || typeof n !== 'object') return;

    if (
      n.type === AST_NODE_TYPES.FunctionDeclaration ||
      n.type === AST_NODE_TYPES.FunctionExpression ||
      n.type === AST_NODE_TYPES.ArrowFunctionExpression
    ) {
      return; // Stop at nested functions
    }

    if (n.type === AST_NODE_TYPES.ReturnStatement && n.argument) {
      returns.push(n.argument);
    }

    for (const key in n) {
      if (key === 'parent') continue; // Avoid circular references
      const child = n[key];
      if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && typeof child.type === 'string') {
        traverse(child);
      }
    }
  }

  if (node.type === AST_NODE_TYPES.BlockStatement) {
    node.body.forEach(traverse);
  }

  return returns;
}

function getExpressionNature(e: TSESTree.Node): 'jsx' | 'boolean' | 'value' | 'unknown' {
  if (e.type === AST_NODE_TYPES.JSXElement || e.type === AST_NODE_TYPES.JSXFragment) return 'jsx';
  if (
    e.type === AST_NODE_TYPES.TemplateLiteral ||
    e.type === AST_NODE_TYPES.ArrayExpression ||
    e.type === AST_NODE_TYPES.ObjectExpression
  ) {
    return 'value';
  }
  if (e.type === AST_NODE_TYPES.Literal) {
    if (typeof e.value === 'boolean') return 'boolean';
    if (typeof e.value === 'string' || typeof e.value === 'number') return 'value';
  }
  if (e.type === AST_NODE_TYPES.BinaryExpression) {
    if (['==', '!=', '===', '!==', '<', '<=', '>', '>=', 'in', 'instanceof'].includes(e.operator)) {
      return 'boolean';
    }
    return 'value';
  }
  if (e.type === AST_NODE_TYPES.UnaryExpression) {
    if (e.operator === '!') return 'boolean';
    if (e.operator === '+' || e.operator === '-' || e.operator === '~') return 'value';
    if (e.operator === 'typeof') return 'value';
  }
  return 'unknown';
}

function getReturnNature(
  node:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression
): 'jsx' | 'boolean' | 'value' | 'unknown' {
  // 1. Check Type Annotations
  if (node.returnType && node.returnType.typeAnnotation) {
    const type = node.returnType.typeAnnotation.type;
    if (type === AST_NODE_TYPES.TSBooleanKeyword) return 'boolean';
    if (
      type === AST_NODE_TYPES.TSStringKeyword ||
      type === AST_NODE_TYPES.TSNumberKeyword ||
      type === AST_NODE_TYPES.TSArrayType ||
      type === AST_NODE_TYPES.TSTupleType ||
      type === AST_NODE_TYPES.TSObjectKeyword
    ) {
      return 'value';
    }
    if (type === AST_NODE_TYPES.TSTypeReference) {
      const typeRef = node.returnType.typeAnnotation as TSESTree.TSTypeReference;
      if (typeRef.typeName?.type === AST_NODE_TYPES.Identifier) {
        if (typeRef.typeName.name === 'Record') return 'value';
        if (
          typeRef.typeName.name === 'JSX_Element' ||
          typeRef.typeName.name === 'ReactNode' ||
          typeRef.typeName.name === 'ReactElement'
        )
          return 'jsx';
      } else if (
        typeRef.typeName?.type === AST_NODE_TYPES.TSQualifiedName &&
        typeRef.typeName.left.type === AST_NODE_TYPES.Identifier &&
        typeRef.typeName.left.name === 'JSX' &&
        typeRef.typeName.right.type === AST_NODE_TYPES.Identifier &&
        typeRef.typeName.right.name === 'Element'
      ) {
        return 'jsx';
      }
    }
  }

  // 2. Check Arrow Function Direct Returns
  if (
    node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    node.body.type !== AST_NODE_TYPES.BlockStatement
  ) {
    return getExpressionNature(node.body);
  }

  // 3. Check Return Statements
  const returns = findReturns(node.body);
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
    },
    schema: [],
    messages: {
      missingRenderPrefix:
        'Functions returning JSX should be prefixed with "render" (e.g., renderComponent).',
      missingBooleanPrefix:
        'Functions returning booleans should be prefixed with a boolean word like "is", "has", "can", "will".',
      missingValuePrefix:
        'Functions returning objects, arrays, numbers, or strings should be prefixed with "get", "calculate", or "determine".',
    },
  },
  defaultOptions: [],
  create(context) {
    function processFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression
        | TSESTree.ArrowFunctionExpression
    ) {
      const name = getFunctionName(node);
      if (!name) return;

      if (shouldIgnore(name)) return;

      const nature = getReturnNature(node);

      if (nature === 'jsx' && !hasPrefix(name, jsxPrefixes)) {
        context.report({
          node,
          messageId: 'missingRenderPrefix',
        });
      } else if (nature === 'boolean' && !hasPrefix(name, booleanPrefixes)) {
        context.report({
          node,
          messageId: 'missingBooleanPrefix',
        });
      } else if (nature === 'value' && !hasPrefix(name, valuePrefixes)) {
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
