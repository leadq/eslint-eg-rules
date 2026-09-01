import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { matchesIgnorePattern } from '../../utils/ast-helpers';

export interface JSXEventHandlerNamingOptions {
  strict?: boolean;
  prefix?: string;
  ignoreProps?: string[];
  ignorePatterns?: string[];
}

type Options = [JSXEventHandlerNamingOptions?];
type MessageIds = 'missingHandlePrefix' | 'strictMismatch';

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{ strict: true, prefix: 'handle' }],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce handler prefix for event handlers locally defined in components.',
      recommended: true,
    } as any,
    messages: {
      missingHandlePrefix:
        "Local event handler '{{name}}' must start with '{{prefix}}' prefix for event '{{event}}'.",
      strictMismatch:
        "Local event handler '{{name}}' must end with the event name '{{event}}' (e.g., '{{prefix}}{{event}}').",
    },
    schema: [
      {
        type: 'object',
        properties: {
          strict: {
            type: 'boolean',
            description: 'If true, requires handler name to end with event name (e.g. handleClick for onClick).',
          },
          prefix: {
            type: 'string',
            description: "Prefix required for handler functions (default: 'handle').",
          },
          ignoreProps: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of JSX prop names to ignore.',
          },
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Glob patterns for files to ignore.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const strictMatch = options.strict !== false;
    const prefix = options.prefix || 'handle';
    const ignoreProps = options.ignoreProps || [];
    const ignorePatterns = options.ignorePatterns || ['**/*.test.*', '**/*.spec.*'];

    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      if (matchesIgnorePattern(filename, ignorePatterns)) {
        return {};
      }
    }

    function isLocalVariable(node: TSESTree.Identifier): boolean {
      const sourceCode = context.sourceCode || context.getSourceCode();
      const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();

      let currentScope: TSESLint.Scope.Scope | null = scope as unknown as TSESLint.Scope.Scope;
      let variable = null;

      while (currentScope) {
        variable = currentScope.variables.find((v: any) => v.name === node.name);
        if (variable) {
          break;
        }
        currentScope = currentScope.upper;
      }

      if (variable) {
        // Check if the variable is defined as a parameter
        const isParam = variable.defs.some((def: any) => def.type === 'Parameter');
        if (isParam) return false;

        // Check if it's an import
        const isImport = variable.defs.some((def: any) => def.type === 'ImportBinding');
        if (isImport) return false;

        // Check if it's declared in the global or module scope (outside any component)
        if (currentScope?.type === 'global' || currentScope?.type === 'module') {
          return false;
        }

        return true;
      }

      return false;
    }

    return {
      JSXAttribute(node: TSESTree.JSXAttribute) {
        const propName = node.name.name;

        // Only check props matching on[A-Z]
        if (typeof propName !== 'string' || !/^on[A-Z]/.test(propName)) {
          return;
        }

        if (ignoreProps.includes(propName)) {
          return;
        }

        // Value must be a JSX expression container with an Identifier
        if (
          !node.value ||
          node.value.type !== 'JSXExpressionContainer' ||
          node.value.expression.type !== 'Identifier'
        ) {
          return;
        }

        const handlerIdentifier = node.value.expression;
        const handlerName = handlerIdentifier.name;

        // If it's a prop or external import, don't enforce
        if (!isLocalVariable(handlerIdentifier)) {
          return;
        }

        const eventName = propName.slice(2); // onClick -> Click

        // Must start with prefix (e.g. 'handle')
        if (!handlerName.startsWith(prefix)) {
          context.report({
            node: handlerIdentifier,
            messageId: 'missingHandlePrefix',
            data: {
              name: handlerName,
              event: eventName,
              prefix,
            },
          });
          return;
        }

        // Strict: Must end with eventName (e.g., handleClick, handleTabClick for Click)
        if (strictMatch && !handlerName.endsWith(eventName)) {
          context.report({
            node: handlerIdentifier,
            messageId: 'strictMismatch',
            data: {
              name: handlerName,
              event: eventName,
              prefix,
            },
          });
        }
      },
    };
  },
};

export default rule;
