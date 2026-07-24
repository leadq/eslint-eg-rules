import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

type MessageIds = 'unusedDependency';
type Options = [{ hooks?: string[] }];

const defaultTargetHooks = [
  'useEffect',
  'useCallback',
  'useMemo',
  'useLayoutEffect',
  'useInsertionEffect',
];

function getHookName(node: TSESTree.CallExpression): string | null {
  if (node.callee.type === AST_NODE_TYPES.Identifier) {
    return node.callee.name;
  }
  if (
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    node.callee.property.type === AST_NODE_TYPES.Identifier
  ) {
    return node.callee.property.name;
  }
  return null;
}

function getRootIdentifier(node: TSESTree.Node): { name: string; node: TSESTree.Node } | null {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return { name: node.name, node };
  }
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return getRootIdentifier(node.object);
  }
  if (node.type === AST_NODE_TYPES.TSAsExpression || node.type === AST_NODE_TYPES.TSTypeAssertion) {
    return getRootIdentifier(node.expression);
  }
  // Handle optional chaining: user?.name → root is "user"
  if (node.type === AST_NODE_TYPES.ChainExpression) {
    return getRootIdentifier(node.expression);
  }
  // Handle non-null assertion: value! → root is "value"
  if (node.type === AST_NODE_TYPES.TSNonNullExpression) {
    return getRootIdentifier(node.expression);
  }
  if (node.type === AST_NODE_TYPES.Literal) {
    return { name: String(node.value), node };
  }
  return null;
}

/**
 * Extracts the full member expression path from a dependency node.
 * e.g., user?.id → ["user", "id"], value! → ["value"], a.b.c → ["a", "b", "c"]
 * Returns null for non-resolvable nodes (computed MemberExpression, CallExpression, etc.).
 */
function getFullDepPath(node: TSESTree.Node): string[] | null {
  if (node.type === AST_NODE_TYPES.TSAsExpression || node.type === AST_NODE_TYPES.TSTypeAssertion) {
    return getFullDepPath(node.expression);
  }
  if (node.type === AST_NODE_TYPES.ChainExpression) {
    return getFullDepPath(node.expression);
  }
  if (node.type === AST_NODE_TYPES.TSNonNullExpression) {
    return getFullDepPath(node.expression);
  }
  if (node.type === AST_NODE_TYPES.Identifier) {
    return [node.name];
  }
  if (
    node.type === AST_NODE_TYPES.MemberExpression &&
    !node.computed &&
    node.property.type === AST_NODE_TYPES.Identifier
  ) {
    const objectPath = getFullDepPath(node.object);
    if (objectPath) {
      return [...objectPath, node.property.name];
    }
  }
  return null;
}

/**
 * Builds the full member expression path upward from a root identifier
 * using the AST parent references set by ESLint.
 * e.g., if `user` is part of `user.name.length`, returns ["user", "name", "length"]
 */
function buildUsagePathUp(identifierNode: TSESTree.Identifier): string[] {
  const path = [identifierNode.name];
  let current: TSESTree.Node = identifierNode;

  while (current.parent) {
    const parent: TSESTree.Node = current.parent;
    if (
      parent.type === AST_NODE_TYPES.MemberExpression &&
      parent.object === current &&
      !parent.computed &&
      parent.property.type === AST_NODE_TYPES.Identifier
    ) {
      path.push(parent.property.name);
      current = parent;
    } else if (parent.type === AST_NODE_TYPES.ChainExpression) {
      // Skip ChainExpression wrapper and continue upward
      current = parent;
    } else {
      break;
    }
  }

  return path;
}

/**
 * Checks if two paths have a prefix relationship (one is a prefix of the other, or they are equal).
 * dep "user.id" matches usage "user" (parent access), "user.id" (exact), or "user.id.toString" (child access).
 */
function isPathPrefixMatch(path1: string[], path2: string[]): boolean {
  const minLen = Math.min(path1.length, path2.length);
  for (let i = 0; i < minLen; i++) {
    if (path1[i] !== path2[i]) return false;
  }
  return true;
}

/**
 * Checks if a member expression dep path is used in the callback.
 * Walks the callback and for each root identifier matching depPath[0],
 * builds the usage path upward and checks for prefix matching.
 */
function isMemberPathUsedInNode(depPath: string[], searchRoot: TSESTree.Node): boolean {
  let found = false;

  function walk(node: TSESTree.Node, parent?: TSESTree.Node) {
    if (found || !node) return;

    if (node.type === AST_NODE_TYPES.Identifier && node.name === depPath[0]) {
      if (parent) {
        if (
          parent.type === AST_NODE_TYPES.Property &&
          parent.key === node &&
          !parent.computed &&
          !parent.shorthand
        ) {
          return;
        }
        if (
          parent.type === AST_NODE_TYPES.MemberExpression &&
          parent.property === node &&
          !parent.computed
        ) {
          return;
        }
        if (
          parent.type === AST_NODE_TYPES.JSXAttribute &&
          (parent.name as unknown) === node
        ) {
          return;
        }
        if (
          (parent.type === AST_NODE_TYPES.MethodDefinition ||
            parent.type === AST_NODE_TYPES.PropertyDefinition) &&
          parent.key === node &&
          !parent.computed
        ) {
          return;
        }
      }

      // Build usage path upward from this root identifier
      const usagePath = buildUsagePathUp(node as TSESTree.Identifier);
      if (isPathPrefixMatch(depPath, usagePath)) {
        found = true;
        return;
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && 'type' in item) {
            walk(item as TSESTree.Node, node);
          }
        }
      } else if (child && typeof child === 'object' && 'type' in child) {
        walk(child as TSESTree.Node, node);
      }
    }
  }

  walk(searchRoot);
  return found;
}


function isIdentifierReferencedInNode(targetName: string, searchRoot: TSESTree.Node): boolean {
  let isReferenced = false;

  function walk(node: TSESTree.Node, parent?: TSESTree.Node) {
    if (isReferenced || !node) {
      return;
    }

    if (node.type === AST_NODE_TYPES.Identifier && node.name === targetName) {
      if (parent) {
        // Ignore property keys in object literals unless it is shorthand { foo }
        if (
          parent.type === AST_NODE_TYPES.Property &&
          parent.key === node &&
          !parent.computed &&
          !parent.shorthand
        ) {
          return;
        }
        // Ignore uncomputed member expression property accesses (e.g., obj.targetName)
        if (
          parent.type === AST_NODE_TYPES.MemberExpression &&
          parent.property === node &&
          !parent.computed
        ) {
          return;
        }
        // Ignore JSX attribute names (e.g., <Comp targetName="val" />)
        if (
          parent.type === AST_NODE_TYPES.JSXAttribute &&
          (parent.name as unknown) === node
        ) {
          return;
        }
        // Ignore method or property definitions in classes
        if (
          (parent.type === AST_NODE_TYPES.MethodDefinition ||
            parent.type === AST_NODE_TYPES.PropertyDefinition) &&
          parent.key === node &&
          !parent.computed
        ) {
          return;
        }
      }

      isReferenced = true;
      return;
    }

    // Traverse child nodes
    for (const key of Object.keys(node)) {
      if (key === 'parent') {
        continue;
      }
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && 'type' in item) {
            walk(item as TSESTree.Node, node);
          }
        }
      } else if (child && typeof child === 'object' && 'type' in child) {
        walk(child as TSESTree.Node, node);
      }
    }
  }

  walk(searchRoot);
  return isReferenced;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow unused variables/dependencies in React hook dependency arrays (useEffect, useCallback, useMemo, etc.). Every item in the dependency array must be referenced within the hook callback.',
    },
    messages: {
      unusedDependency:
        "Dependency '{{name}}' is listed in the '{{hookName}}' dependency array, but it is never referenced inside the hook callback.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          hooks: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of hook function names to inspect for unused dependencies.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const targetHooks = options.hooks && options.hooks.length > 0 ? options.hooks : defaultTargetHooks;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const hookName = getHookName(node);
        if (!hookName || !targetHooks.includes(hookName)) {
          return;
        }

        const [callbackArg, depsArg] = node.arguments;
        if (!callbackArg || !depsArg) {
          return;
        }

        // Callback must be a function expression or arrow function
        if (
          callbackArg.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
          callbackArg.type !== AST_NODE_TYPES.FunctionExpression
        ) {
          return;
        }

        // Deps argument must be an ArrayExpression
        if (depsArg.type !== AST_NODE_TYPES.ArrayExpression) {
          return;
        }

        for (const depItem of depsArg.elements) {
          if (!depItem || depItem.type === AST_NODE_TYPES.SpreadElement) {
            continue;
          }

          const rootInfo = getRootIdentifier(depItem);
          if (!rootInfo) {
            continue;
          }

          const fullPath = getFullDepPath(depItem);

          let referenced: boolean;
          if (fullPath && fullPath.length > 1) {
            // Member expression dep (e.g., user.id): use path-based matching
            referenced = isMemberPathUsedInNode(fullPath, callbackArg);
          } else {
            // Simple identifier or literal dep: use root name matching
            referenced = isIdentifierReferencedInNode(rootInfo.name, callbackArg);
          }

          if (!referenced) {
            context.report({
              node: depItem,
              messageId: 'unusedDependency',
              data: {
                name: fullPath ? fullPath.join('.') : rootInfo.name,
                hookName,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
