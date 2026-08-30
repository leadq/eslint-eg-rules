import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as path from 'path';

type MessageIds = 'colocationViolation';

export interface UtilHookColocationOptions {
  componentDirs?: string[];
  utilFolderNames?: string[];
}

type Options = [UtilHookColocationOptions?];

const DEFAULT_OPTIONS: Required<UtilHookColocationOptions> = {
  componentDirs: ['components', 'pages', 'views', 'modules', 'app', 'features'],
  utilFolderNames: ['utils', 'hooks'],
};

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces Colocation for local utils and hooks: helpers inside component directories must not be imported outside their component hierarchy.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          componentDirs: {
            type: 'array',
            items: { type: 'string' },
          },
          utilFolderNames: {
            type: 'array',
            items: { type: 'string' },
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
    const currentDir = path.posix.dirname(normalizedCurrentFile);

    const compDirPattern = options.componentDirs.join('|');
    const utilFolderPattern = options.utilFolderNames.join('|');

    // Regex to match a component-scoped util/hook: e.g. .../(components|pages)/.../<ComponentName>/(utils|hooks)/...
    const localUtilRegex = new RegExp(
      `(.*\\/(?:${compDirPattern})(?:\\/.*?)*?\\/([^/]+))\\/(${utilFolderPattern})(?:\\/|$)`
    );

    function checkImportSource(sourceValue: string, node: TSESTree.Node) {
      if (!sourceValue || typeof sourceValue !== 'string') return;

      let resolvedTarget: string;

      if (sourceValue.startsWith('.')) {
        resolvedTarget = path.posix.normalize(path.posix.join(currentDir, sourceValue));
      } else if (sourceValue.startsWith('@/')) {
        resolvedTarget = path.posix.normalize('/src/' + sourceValue.slice(2));
      } else if (sourceValue.startsWith('~/')) {
        resolvedTarget = path.posix.normalize('/src/' + sourceValue.slice(2));
      } else if (sourceValue.startsWith('src/')) {
        resolvedTarget = path.posix.normalize('/' + sourceValue);
      } else {
        return; // External package import
      }

      const match = resolvedTarget.match(localUtilRegex);
      if (!match) {
        return; // Not a local component util/hook (e.g. global /src/utils or /src/hooks)
      }

      const componentRoot = match[1]; // e.g. /src/components/AccountDetail
      const componentName = match[2]; // e.g. AccountDetail
      const folderType = match[3]; // e.g. utils or hooks

      // Check if current file is inside the componentRoot
      const isInsideComponent =
        normalizedCurrentFile === componentRoot ||
        normalizedCurrentFile.startsWith(componentRoot + '/');

      if (!isInsideComponent) {
        context.report({
          node,
          messageId: 'colocationViolation',
          data: {
            folderType,
            importedPath: sourceValue,
            componentName,
            importerPath: normalizedCurrentFile,
          },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkImportSource(node.source.value, node);
      },
      ExportNamedDeclaration(node) {
        if (node.source && typeof node.source.value === 'string') {
          checkImportSource(node.source.value, node);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && typeof node.source.value === 'string') {
          checkImportSource(node.source.value, node);
        }
      },
      ImportExpression(node) {
        if (
          node.source.type === AST_NODE_TYPES.Literal &&
          typeof node.source.value === 'string'
        ) {
          checkImportSource(node.source.value, node);
        }
      },
    };
  },
};

export default rule;
