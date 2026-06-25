import { TSESLint } from '@typescript-eslint/utils';

type Options = [{ suffixes?: string[] }];
type MessageIds = 'invalidSuffix' | 'consecutiveSuffix';

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce specific suffixes for types/interfaces in the API folder',
    },
    messages: {
      invalidSuffix:
        "Type/Interface '{{name}}' in the API folder must end with one of the allowed suffixes: {{suffixes}}.",
      consecutiveSuffix:
        "Type/Interface '{{name}}' cannot have consecutive suffixes ('{{consecutive}}' followed by '{{matched}}').",
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
            minItems: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const isApiFolder = filename.includes('/src/apis/') || filename.includes('\\src\\apis\\');

    // If it's not in the API folder, we don't enforce anything
    if (!isApiFolder) {
      return {};
    }

    const options = context.options[0] || {};
    const suffixes =
      options.suffixes && options.suffixes.length > 0
        ? options.suffixes
        : ['Model', 'Response', 'Request'];

    function checkNode(node: any, name: string) {
      const matchedSuffix = suffixes.find((s) => name.endsWith(s));

      if (!matchedSuffix) {
        context.report({
          node,
          messageId: 'invalidSuffix',
          data: {
            name,
            suffixes: suffixes.join(', '),
          },
        });
        return;
      }

      const remainingName = name.slice(0, -matchedSuffix.length);
      const consecutiveSuffix = suffixes.find((s) => remainingName.endsWith(s));

      if (consecutiveSuffix) {
        context.report({
          node,
          messageId: 'consecutiveSuffix',
          data: {
            name,
            consecutive: consecutiveSuffix,
            matched: matchedSuffix,
          },
        });
      }
    }

    return {
      TSInterfaceDeclaration(node) {
        checkNode(node.id, node.id.name);
      },
      TSTypeAliasDeclaration(node) {
        checkNode(node.id, node.id.name);
      },
    };
  },
};

export default rule;
