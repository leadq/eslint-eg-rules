import { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Options = [{ strict?: boolean }];
type MessageIds = 'missingHandlePrefix' | 'strictMismatch';

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{ strict: true }],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce handler prefix for event handlers locally defined in components.',
    },
    messages: {
      missingHandlePrefix:
        "Local event handler '{{name}}' must start with 'handle' prefix for event '{{event}}'.",
      strictMismatch:
        "Local event handler '{{name}}' must end with the event name '{{event}}' (e.g., 'handle{{event}}').",
    },
    schema: [
      {
        type: 'object',
        properties: {
          strict: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const strictMatch = options.strict !== false;

    function isLocalVariable(node: TSESTree.Identifier): boolean {
      const sourceCode = context.getSourceCode();
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
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return;

        const propName = node.name.name;
        if (!/^on[A-Z]/.test(propName)) return; // Not an event handler prop

        if (!node.value) return;

        if (node.value.type === 'JSXExpressionContainer') {
          if (node.value.expression.type === 'Identifier') {
            const handlerIdentifier = node.value.expression;
            const handlerName = handlerIdentifier.name;

            // Only check locally defined functions (inside the component's scope)
            if (isLocalVariable(handlerIdentifier)) {
              if (!handlerName.startsWith('handle')) {
                context.report({
                  node: handlerIdentifier,
                  messageId: 'missingHandlePrefix',
                  data: {
                    name: handlerName,
                    event: propName,
                  },
                });
                return;
              }

              if (strictMatch) {
                const eventName = propName.replace(/^on/, '');
                if (!handlerName.endsWith(eventName)) {
                  context.report({
                    node: handlerIdentifier,
                    messageId: 'strictMismatch',
                    data: {
                      name: handlerName,
                      event: eventName,
                    },
                  });
                }
              }
            }
          } else if (
            node.value.expression.type === 'ArrowFunctionExpression' ||
            node.value.expression.type === 'FunctionExpression'
          ) {
            // If we want to check named function expressions inline:
            // <div onClick={function handleClick() {}} />
            // but user requested "scope unda tanımlanan", usually means previously defined.
            // We can ignore inline arrow functions.
          }
        }
      },
    };
  },
};

export default rule;
