import { TSESLint } from '@typescript-eslint/utils';
import { matchesIgnorePattern } from '../../utils/ast-helpers';

export interface ApiTypeSuffixOptions {
  suffixes?: string[];
  apiFolderPatterns?: string[];
  ignorePatterns?: string[];
}

type Options = [ApiTypeSuffixOptions?];
type MessageIds = 'invalidSuffix' | 'consecutiveSuffix';

const defaultSuffixes = ['Model', 'Response', 'Request'];
const defaultFolderPatterns = ['src/apis', 'src/api'];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce specific suffixes for types/interfaces in the API folder',
      recommended: true,
    } as any,
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
            description: 'Allowed suffixes for API types and interfaces.',
          },
          apiFolderPatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Folder paths that are considered API directories.',
          },
          ignorePatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Glob patterns for files to ignore.',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const normalized = (filename || '').replace(/\\/g, '/');

    const options = context.options[0] || {};
    const ignorePatterns = options.ignorePatterns || ['**/*.test.*', '**/*.spec.*'];
    if (matchesIgnorePattern(normalized, ignorePatterns)) {
      return {};
    }

    const folderPatterns =
      options.apiFolderPatterns && options.apiFolderPatterns.length > 0
        ? options.apiFolderPatterns
        : defaultFolderPatterns;

    const isApiFolder = folderPatterns.some((folder) => {
      const cleanFolder = folder.replace(/^\.?\/?/, '');
      return normalized.includes(`/${cleanFolder}/`) || normalized.startsWith(`${cleanFolder}/`);
    });

    // If it's not in the API folder, we don't enforce anything
    if (!isApiFolder) {
      return {};
    }

    const suffixes =
      options.suffixes && options.suffixes.length > 0
        ? options.suffixes
        : defaultSuffixes;

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

      // Check if there is another suffix immediately preceding the matchedSuffix
      const withoutSuffix = name.slice(0, -matchedSuffix.length);
      const precedingSuffix = suffixes.find((s) => withoutSuffix.endsWith(s));

      if (precedingSuffix) {
        context.report({
          node,
          messageId: 'consecutiveSuffix',
          data: {
            name,
            consecutive: precedingSuffix,
            matched: matchedSuffix,
          },
        });
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        checkNode(node.id, node.id.name);
      },
      TSInterfaceDeclaration(node) {
        checkNode(node.id, node.id.name);
      },
    };
  },
};

export default rule;
