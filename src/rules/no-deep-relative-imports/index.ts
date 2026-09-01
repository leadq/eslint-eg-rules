import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  countRelativeParentDepth,
  extractImportFromNode,
} from '../../utils/path-resolver';

type MessageIds = 'deepRelativeImport';

export interface NoDeepRelativeImportsOptions {
  maxDepth?: number;
  suggestedAlias?: string;
}

type Options = [NoDeepRelativeImportsOptions?];

const DEFAULT_OPTIONS: Required<NoDeepRelativeImportsOptions> = {
  maxDepth: 2,
  suggestedAlias: '@/',
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
          },
          suggestedAlias: {
            type: 'string',
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
