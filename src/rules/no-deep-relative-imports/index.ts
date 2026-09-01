import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  countRelativeParentDepth,
  extractImportFromNode,
} from '../../utils/path-resolver';
import { matchesIgnorePattern } from '../../utils/ast-helpers';

type MessageIds = 'deepRelativeImport';

export interface NoDeepRelativeImportsOptions {
  maxDepth?: number;
  suggestedAlias?: string;
  ignorePatterns?: string[];
}

type Options = [NoDeepRelativeImportsOptions?];

const DEFAULT_OPTIONS: Required<NoDeepRelativeImportsOptions> = {
  maxDepth: 2,
  suggestedAlias: '@/',
  ignorePatterns: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
};

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows deep relative imports (e.g. ../../../) exceeding a maximum allowed depth and enforces path aliases instead.',
      recommended: true,
    } as any,
    schema: [
      {
        type: 'object',
        properties: {
          maxDepth: {
            type: 'integer',
            minimum: 1,
            description: 'Maximum allowed directory traversal levels for relative imports.',
          },
          suggestedAlias: {
            type: 'string',
            description: 'Suggested path alias to use instead (e.g. @/).',
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
    messages: {
      deepRelativeImport:
        "Deep relative import '{{importPath}}' traverses {{actualDepth}} levels up (max allowed: {{maxDepth}}). Use path alias '{{suggestedAlias}}' instead.",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<NoDeepRelativeImportsOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      if (matchesIgnorePattern(filename, options.ignorePatterns)) {
        return {};
      }
    }

    function checkNode(node: TSESTree.Node) {
      const extracted = extractImportFromNode(node);
      if (!extracted) return;

      const { source } = extracted;
      const actualDepth = countRelativeParentDepth(source);
      if (actualDepth > options.maxDepth) {
        context.report({
          node: extracted.node,
          messageId: 'deepRelativeImport',
          data: {
            importPath: source,
            actualDepth,
            maxDepth: options.maxDepth,
            suggestedAlias: options.suggestedAlias,
          },
        });
      }
    }

    return {
      ImportDeclaration: checkNode,
      ExportNamedDeclaration: checkNode,
      ExportAllDeclaration: checkNode,
      ImportExpression: checkNode,
      CallExpression: checkNode,
      TSImportEqualsDeclaration: checkNode,
    };
  },
};

export default rule;
