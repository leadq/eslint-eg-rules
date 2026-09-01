import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as path from 'path';
import {
  normalizePath,
  resolveImportPath,
  extractComponentHelperContext,
  isDescendantOrSelf,
  extractImportFromNode,
} from '../../utils/path-resolver';
import { matchesIgnorePattern } from '../../utils/ast-helpers';

type MessageIds = 'colocationViolation';

export interface UtilHookColocationOptions {
  componentDirs?: string[];
  utilFolderNames?: string[];
  ignorePatterns?: string[];
}

type Options = [UtilHookColocationOptions?];

const DEFAULT_OPTIONS: Required<UtilHookColocationOptions> = {
  componentDirs: ['components', 'pages', 'views', 'modules', 'app', 'features', 'widgets'],
  utilFolderNames: ['utils', 'hooks', 'helpers'],
  ignorePatterns: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
};

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces Colocation for local utils and hooks: helpers inside component directories must not be imported outside their component hierarchy.',
      recommended: true,
    } as any,
    schema: [
      {
        type: 'object',
        properties: {
          componentDirs: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of top-level directory names where components reside.',
          },
          utilFolderNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Folder names that represent localized helpers (e.g. utils, hooks).',
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
      colocationViolation:
        "Local {{folderType}} '{{importedPath}}' belongs to '{{componentName}}' and cannot be imported from '{{importerPath}}'. Move it to the nearest common parent or 'src/{{folderType}}/'",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<UtilHookColocationOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const currentFilename = context.filename ?? context.getFilename();
    if (!currentFilename || currentFilename === '<input>' || currentFilename === '<text>') {
      return {};
    }

    const normalizedCurrentFile = normalizePath(currentFilename);
    if (matchesIgnorePattern(normalizedCurrentFile, options.ignorePatterns)) {
      return {};
    }

    const currentDir = path.posix.dirname(normalizedCurrentFile);

    function checkNode(node: TSESTree.Node) {
      const extracted = extractImportFromNode(node);
      if (!extracted) return;

      const { source } = extracted;
      const resolvedTarget = resolveImportPath(source, currentDir);
      if (!resolvedTarget) {
        return; // External package import
      }

      const helperContext = extractComponentHelperContext(
        resolvedTarget,
        options.componentDirs,
        options.utilFolderNames
      );

      if (!helperContext) {
        return; // Not a component-scoped util/hook (e.g. global /src/utils or /src/hooks)
      }

      const { componentRoot, componentName, folderType } = helperContext;

      // Check if the current file is inside the componentRoot or its descendants
      const isAllowed = isDescendantOrSelf(normalizedCurrentFile, componentRoot);

      if (!isAllowed) {
        context.report({
          node: extracted.node,
          messageId: 'colocationViolation',
          data: {
            folderType,
            importedPath: source,
            componentName,
            importerPath: normalizedCurrentFile,
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
