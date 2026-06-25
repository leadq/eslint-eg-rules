import { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Options = [{ conjunctions?: string[]; ignoreTestPatterns?: string[] }];
type MessageIds = 'itMustStartWithShould' | 'testMustContainConjunction';

export const defaultConjunctions = [
  'if',
  'when',
  'while',
  'after',
  'before',
  'with',
  'without',
  'unless',
  'since',
  'until',
  'for',
  'during',
];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce conventions for test descriptions in "it" and "test" statements.',
    },
    messages: {
      itMustStartWithShould: '"it" statements must start with "should ".',
      testMustContainConjunction:
        '"test" statements must contain a conjunction (e.g. {{conjunctions}} etc.).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          conjunctions: {
            type: 'array',
            items: {
              type: 'string',
            },
            minItems: 1,
          },
          ignoreTestPatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const conjunctions =
      options.conjunctions && options.conjunctions.length > 0
        ? options.conjunctions
        : defaultConjunctions;

    const filename = context.filename || context.getFilename();

    let isTestFile = false;

    if (filename.includes('.test.') || filename.includes('.spec.')) {
      isTestFile = true;
    } else if (
      (filename.includes('/__tests__/') ||
        filename.includes('\\__tests__\\') ||
        filename.includes('/__specs__/') ||
        filename.includes('\\__specs__\\')) &&
      !filename.includes('.mock.')
    ) {
      isTestFile = true;
    }

    const ignoreTestPatterns = options.ignoreTestPatterns || [];
    for (const pattern of ignoreTestPatterns) {
      try {
        if (new RegExp(pattern).test(filename)) {
          isTestFile = false;
          break;
        }
      } catch (e) {
        // invalid regex, ignore
      }
    }

    if (!isTestFile) {
      return {};
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        let callName: string | null = null;

        if (node.callee.type === 'Identifier') {
          callName = node.callee.name;
        } else if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier'
        ) {
          // Supports cases like "it.only", "test.skip"
          callName = node.callee.object.name;
        }

        if (callName !== 'it' && callName !== 'test') {
          return;
        }

        const args = node.arguments;
        if (args.length === 0) {
          return;
        }

        const firstArg = args[0];
        let message = '';

        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          message = firstArg.value;
        } else if (firstArg.type === 'TemplateLiteral') {
          // For template literals just check by concatenating the raw string parts
          message = firstArg.quasis.map((q) => q.value.raw).join('');
        } else {
          return;
        }

        if (callName === 'it') {
          if (!message.startsWith('should ')) {
            context.report({
              node: firstArg,
              messageId: 'itMustStartWithShould',
            });
          }
        } else if (callName === 'test') {
          const hasConjunction = conjunctions.some((conj) => {
            // Using word boundaries to match exact conjunctions
            const regex = new RegExp(`\\b${conj}\\b`, 'i');
            return regex.test(message);
          });

          if (!hasConjunction) {
            context.report({
              node: firstArg,
              messageId: 'testMustContainConjunction',
              data: {
                conjunctions: conjunctions.slice(0, 3).join(', '),
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
