import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as path from 'path';
import {
  normalizePath,
  resolveImportPath,
  getFileLayer,
  extractImportFromNode,
} from '../../utils/path-resolver';

type MessageIds = 'upstreamImportViolation';

export interface NoUpstreamImportsOptions {
  sharedLayers?: string[];
  uiLayers?: string[];
  allowTypeImports?: boolean;
}

type Options = [NoUpstreamImportsOptions?];

const DEFAULT_OPTIONS: Required<NoUpstreamImportsOptions> = {
  sharedLayers: ['utils', 'hooks', 'types', 'constants', 'services', 'apis', 'helpers'],
  uiLayers: ['components', 'pages', 'views', 'app', 'features', 'widgets'],
  allowTypeImports: false,
};

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevents shared foundational layers (utils, hooks, types, services, apis) from importing from higher-level UI layers (components, pages, views, app).',
      recommended: true,
    } as any,
    schema: [
      {
        type: 'object',
        properties: {
          sharedLayers: {
            type: 'array',
            items: { type: 'string' },
          },
          uiLayers: {
            type: 'array',
            items: { type: 'string' },
          },
          allowTypeImports: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      upstreamImportViolation:
        "Shared layer '{{currentLayer}}' cannot import from UI layer '{{importedLayer}}' ('{{importedPath}}'). Move shared logic or models to a lower layer or pass them via arguments.",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<NoUpstreamImportsOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const currentFilename = context.filename ?? context.getFilename();
    if (!currentFilename || currentFilename === '<input>' || currentFilename === '<text>') {
      return {};
    }

    const normalizedCurrentFile = normalizePath(currentFilename);
    const currentLayerInfo = getFileLayer(
      normalizedCurrentFile,
      options.sharedLayers,
      options.uiLayers
    );

    // Only enforce when current file is inside a root shared layer (e.g. /src/utils/..., /src/hooks/...)
    if (!currentLayerInfo || currentLayerInfo.type !== 'shared') {
      return {};
    }

    const currentLayerName = currentLayerInfo.layer;
    const currentDir = path.posix.dirname(normalizedCurrentFile);

    function checkNode(node: TSESTree.Node) {
      const extracted = extractImportFromNode(node);
      if (!extracted) return;

      const { source, isTypeOnly } = extracted;
      if (isTypeOnly && options.allowTypeImports) return;

      const resolvedTarget = resolveImportPath(source, currentDir);
      if (!resolvedTarget) {
        return; // External package import
      }

      const importedLayerInfo = getFileLayer(
        resolvedTarget,
        options.sharedLayers,
        options.uiLayers
      );

      if (importedLayerInfo && importedLayerInfo.type === 'ui') {
        context.report({
          node: extracted.node,
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: currentLayerName,
            importedLayer: importedLayerInfo.layer,
            importedPath: source,
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
