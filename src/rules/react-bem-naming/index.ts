import { TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds =
  | 'invalidTripleUnderscore'
  | 'invalidTripleDash'
  | 'invalidMultipleUnderscoreChains'
  | 'invalidMultipleDashChains'
  | 'invalidModifierBeforeElement'
  | 'kebabCaseExpected'
  | 'camelCaseExpected'
  | 'strictRootExpected';

type Options = [{ mode?: 'kebab-case' | 'camelCase' | 'strict' }];

export const reactBemNaming: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce BEM naming methodology for React component class names.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['kebab-case', 'camelCase', 'strict'],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidTripleUnderscore: 'BEM classes cannot contain 3 or more underscores.',
      invalidTripleDash: 'BEM classes cannot contain 3 or more dashes.',
      invalidMultipleUnderscoreChains:
        'BEM classes cannot have multiple element levels (e.g., table__header__cell).',
      invalidMultipleDashChains:
        'BEM classes cannot have multiple modifiers (e.g., table--isBordered--large).',
      invalidModifierBeforeElement:
        'An element cannot follow a modifier (e.g., table--dark__header).',
      kebabCaseExpected: 'BEM {{part}} "{{val}}" must be in kebab-case.',
      camelCaseExpected: 'BEM {{part}} "{{val}}" must be in camelCase.',
      strictRootExpected:
        'In strict mode, root class or BEM block "{{val}}" must exactly match the camelCased component name "{{componentName}}".',
    },
  },
  defaultOptions: [{ mode: 'kebab-case' }],
  create(context) {
    const options = context.options[0] || {};
    const mode = options.mode || 'kebab-case';

    function getReactComponentName(node: TSESTree.Node): string | null {
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        if (
          current.type === 'FunctionDeclaration' &&
          current.id &&
          /^[A-Z]/.test(current.id.name)
        ) {
          return current.id.name;
        }
        if (
          (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') &&
          current.parent
        ) {
          if (
            current.parent.type === 'VariableDeclarator' &&
            current.parent.id.type === 'Identifier' &&
            /^[A-Z]/.test(current.parent.id.name)
          ) {
            return current.parent.id.name;
          }
        }
        current = current.parent;
      }
      return null;
    }

    function checkClassString(
      cls: string,
      node: TSESTree.Node,
      sourceType: 'literal' | 'member',
      componentName: string | null
    ) {
      if (!cls || typeof cls !== 'string') return;

      const hasDoubleUnderscore = cls.includes('__');
      const hasDoubleDash = cls.includes('--');
      const isBem = hasDoubleUnderscore || hasDoubleDash;

      if (cls.includes('___')) {
        context.report({ node, messageId: 'invalidTripleUnderscore' });
        return;
      }
      if (cls.includes('---')) {
        context.report({ node, messageId: 'invalidTripleDash' });
        return;
      }
      if ((cls.match(/__/g) || []).length > 1) {
        context.report({ node, messageId: 'invalidMultipleUnderscoreChains' });
        return;
      }
      if ((cls.match(/--/g) || []).length > 1) {
        context.report({ node, messageId: 'invalidMultipleDashChains' });
        return;
      }
      if (/--.*__/.test(cls)) {
        context.report({ node, messageId: 'invalidModifierBeforeElement' });
        return;
      }

      const shouldEnforceRootMatch = mode === 'strict' && (isBem || sourceType === 'member');
      const shouldEnforceCase = isBem || sourceType === 'member';

      if (!shouldEnforceCase && !shouldEnforceRootMatch) {
        return;
      }

      let block = cls;
      let element: string | null = null;
      let modifier: string | null = null;

      if (hasDoubleDash) {
        const parts = cls.split('--');
        block = parts[0];
        modifier = parts.slice(1).join('--');
      }

      if (block.includes('__')) {
        const parts = block.split('__');
        block = parts[0];
        element = parts.slice(1).join('__');
      }

      const isKebab = (str: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
      const isCamel = (str: string) => /^[a-z][a-zA-Z0-9]*$/.test(str);

      if (shouldEnforceRootMatch && componentName) {
        const expectedBlock = componentName.charAt(0).toLowerCase() + componentName.slice(1);
        if (block !== expectedBlock) {
          context.report({
            node,
            messageId: 'strictRootExpected',
            data: { val: block, componentName: expectedBlock },
          });
          return;
        }
      }

      const validateCase = (val: string, partName: string) => {
        // Empty parts can happen if there are trailing '__' or '--', we don't want to double report
        if (!val) return true;

        if (mode === 'kebab-case') {
          if (!isKebab(val)) {
            context.report({ node, messageId: 'kebabCaseExpected', data: { part: partName, val } });
            return false;
          }
        } else {
          if (!isCamel(val)) {
            context.report({ node, messageId: 'camelCaseExpected', data: { part: partName, val } });
            return false;
          }
        }
        return true;
      };

      if (!validateCase(block, 'block')) return;
      if (element && !validateCase(element, 'element')) return;
      if (modifier && !validateCase(modifier, 'modifier')) return;
    }

    function extractFromExpression(expr: TSESTree.Node, componentName: string | null) {
      if (expr.type === 'Literal' && typeof expr.value === 'string') {
        const parts = expr.value.split(/\s+/).filter(Boolean);
        parts.forEach((p) => checkClassString(p, expr, 'literal', componentName));
      } else if (expr.type === 'TemplateLiteral') {
        expr.quasis.forEach((quasi) => {
          const parts = quasi.value.raw.split(/\s+/).filter(Boolean);
          parts.forEach((p) => checkClassString(p, quasi, 'literal', componentName));
        });
        expr.expressions.forEach((e) => extractFromExpression(e, componentName));
      } else if (expr.type === 'MemberExpression') {
        if (!expr.computed && expr.property.type === 'Identifier') {
          checkClassString(expr.property.name, expr.property, 'member', componentName);
        } else if (
          expr.computed &&
          expr.property.type === 'Literal' &&
          typeof expr.property.value === 'string'
        ) {
          checkClassString(expr.property.value, expr.property, 'member', componentName);
        }
      } else if (expr.type === 'ObjectExpression') {
        expr.properties.forEach((prop) => {
          if (prop.type === 'Property') {
            if (prop.key.type === 'Identifier' && !prop.computed) {
              checkClassString(prop.key.name, prop.key, 'literal', componentName);
            } else if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
              const parts = prop.key.value.split(/\s+/).filter(Boolean);
              parts.forEach((p) => checkClassString(p, prop.key, 'literal', componentName));
            }
          }
        });
      } else if (expr.type === 'ArrayExpression') {
        expr.elements.forEach((el) => {
          if (el) extractFromExpression(el, componentName);
        });
      } else if (expr.type === 'CallExpression') {
        expr.arguments.forEach((arg) => extractFromExpression(arg, componentName));
      } else if (expr.type === 'ConditionalExpression') {
        extractFromExpression(expr.consequent, componentName);
        extractFromExpression(expr.alternate, componentName);
      } else if (expr.type === 'LogicalExpression') {
        extractFromExpression(expr.left, componentName);
        extractFromExpression(expr.right, componentName);
      }
    }

    return {
      JSXAttribute(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          (node.name.name === 'className' || node.name.name === 'classes') &&
          node.value
        ) {
          const componentName = getReactComponentName(node);
          if (node.value.type === 'Literal') {
            extractFromExpression(node.value, componentName);
          } else if (node.value.type === 'JSXExpressionContainer') {
            if (node.value.expression.type !== 'JSXEmptyExpression') {
              extractFromExpression(node.value.expression, componentName);
            }
          }
        }
      },
    };
  },
};

export default reactBemNaming;
