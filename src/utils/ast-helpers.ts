import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

/**
 * Unwraps TypeScript casting (as, <Type>, satisfies), non-null assertions (!),
 * and parentheses from an expression node to reveal the raw underlying AST node.
 */
export function unwrapExpression(
  node: TSESTree.Node | null | undefined
): TSESTree.Node | null | undefined {
  let current = node;
  while (current) {
    if (
      current.type === AST_NODE_TYPES.TSAsExpression ||
      current.type === AST_NODE_TYPES.TSTypeAssertion ||
      current.type === AST_NODE_TYPES.TSNonNullExpression ||
      (current as any).type === 'TSSatisfiesExpression' ||
      (current as any).type === 'ParenthesizedExpression' ||
      (current as any).type === 'TypeCastExpression'
    ) {
      current = (current as any).expression;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Checks whether an AST node is a JSX element, fragment, or a conditional/logical expression resolving to JSX.
 */
export function isJSXNode(node: TSESTree.Node | null | undefined): boolean {
  if (!node) return false;
  const unwrapped = unwrapExpression(node);
  if (!unwrapped) return false;

  if (
    unwrapped.type === AST_NODE_TYPES.JSXElement ||
    unwrapped.type === AST_NODE_TYPES.JSXFragment
  ) {
    return true;
  }
  if (unwrapped.type === AST_NODE_TYPES.ConditionalExpression) {
    return isJSXNode(unwrapped.consequent) || isJSXNode(unwrapped.alternate);
  }
  if (unwrapped.type === AST_NODE_TYPES.LogicalExpression) {
    return isJSXNode(unwrapped.right) || isJSXNode(unwrapped.left);
  }
  return false;
}

/**
 * Checks whether a function block or concise expression body returns JSX.
 * Avoids false matches by not traversing into nested inner functions.
 */
export function functionBodyReturnsJSX(body: TSESTree.Node | null | undefined): boolean {
  if (!body) return false;
  const unwrappedBody = unwrapExpression(body);
  if (!unwrappedBody) return false;

  if (unwrappedBody.type !== AST_NODE_TYPES.BlockStatement) {
    return isJSXNode(unwrappedBody);
  }

  let found = false;

  function traverse(node: TSESTree.Node) {
    if (found) return;

    // Do not traverse into nested sub-functions
    if (
      node !== unwrappedBody &&
      (node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.FunctionExpression ||
        node.type === AST_NODE_TYPES.ArrowFunctionExpression)
    ) {
      return;
    }

    if (node.type === AST_NODE_TYPES.ReturnStatement) {
      if (isJSXNode(node.argument)) {
        found = true;
      }
      return;
    }

    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              traverse(item);
            }
          }
        } else if (child.type) {
          traverse(child);
        }
      }
    }
  }

  traverse(unwrappedBody);
  return found;
}

/**
 * Checks if a CallExpression is a React wrapper call (memo, forwardRef, lazy).
 */
export function isComponentWrapperCall(node: TSESTree.Node): boolean {
  const unwrapped = unwrapExpression(node);
  if (!unwrapped || unwrapped.type !== AST_NODE_TYPES.CallExpression) return false;
  const callee = unwrapExpression(unwrapped.callee);
  if (!callee) return false;

  // React.memo, React.forwardRef, React.lazy
  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.object.type === AST_NODE_TYPES.Identifier &&
    callee.object.name === 'React' &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    ['memo', 'forwardRef', 'lazy'].includes(callee.property.name)
  ) {
    return true;
  }

  // memo, forwardRef, lazy
  if (
    callee.type === AST_NODE_TYPES.Identifier &&
    ['memo', 'forwardRef', 'lazy'].includes(callee.name)
  ) {
    return true;
  }

  return false;
}

/**
 * Checks whether an AST node is a function or callable expression.
 */
export function isFunctionOrCallable(node: TSESTree.Node | null | undefined): boolean {
  const unwrapped = unwrapExpression(node);
  if (!unwrapped) return false;

  if (
    unwrapped.type === AST_NODE_TYPES.FunctionDeclaration ||
    unwrapped.type === AST_NODE_TYPES.FunctionExpression ||
    unwrapped.type === AST_NODE_TYPES.ArrowFunctionExpression
  ) {
    return true;
  }

  if (isComponentWrapperCall(unwrapped)) {
    const call = unwrapped as TSESTree.CallExpression;
    if (call.arguments.length > 0 && isFunctionOrCallable(call.arguments[0])) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a VariableDeclarator represents a constant value (not a function or callable).
 * e.g. export const DEFAULT_FORMAT = 'YYYY-MM-DD';
 * export const CONFIG = { a: 1 } as const;
 */
export function isConstantDeclaration(declarator: TSESTree.VariableDeclarator): boolean {
  if (!declarator.init) return true;
  return !isFunctionOrCallable(declarator.init);
}

/**
 * Checks if a string or function identifier is a React Hook (starts with "use" followed by an uppercase letter).
 */
export function isReactHook(name: string): boolean {
  return /^use[A-Z0-9]/.test(name) || name === 'use';
}

/**
 * Case validation helpers
 */
export function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export function isCamelCase(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name);
}

export function isKebabCase(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

/**
 * Checks whether a given file path matches any glob-like ignore patterns (e.g. *.test.*, *.stories.*).
 */
export function matchesIgnorePattern(filePath: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  const normalized = filePath.replace(/\\/g, '/');

  for (const pattern of patterns) {
    // Simple fast glob-to-regex converter
    const regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '.*')
      .replace(/(?<!\.)\*/g, '[^/]*');
    const regex = new RegExp(`(^|\\/)${regexStr}($|\\/)`);
    if (regex.test(normalized)) {
      return true;
    }
  }

  return false;
}
