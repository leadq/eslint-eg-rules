import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as path from 'path';

/**
 * Normalizes backslashes to forward slashes for consistent cross-platform matching.
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Converts any absolute or workspace path into a root-relative path (e.g. /src/components/...)
 * ensuring that comparisons between relative imports and aliases work seamlessly across all OSes and monorepos.
 */
export function toRootRelativePath(filePath: string): string {
  const normalized = normalizePath(filePath);
  const srcIndex = normalized.lastIndexOf('/src/');
  if (srcIndex !== -1) {
    return normalized.slice(srcIndex);
  }
  if (normalized.startsWith('src/')) {
    return '/' + normalized;
  }
  if (normalized.startsWith('/')) {
    return normalized;
  }
  return '/' + normalized;
}

const COMMON_ALIAS_PREFIXES = [
  'apis',
  'components',
  'contexts',
  'constants',
  'hooks',
  'pages',
  'services',
  'types',
  'utils',
  'views',
  'features',
  'modules',
  'app',
  'widgets',
  'shared',
];

/**
 * Resolves an import source string (relative or alias) to a standardized root-relative posix path.
 */
export function resolveImportPath(sourceValue: string, currentFileDir: string): string | null {
  if (!sourceValue || typeof sourceValue !== 'string') {
    return null;
  }

  const normalizedDir = normalizePath(currentFileDir);

  if (sourceValue.startsWith('.')) {
    const joined = path.posix.normalize(path.posix.join(normalizedDir, sourceValue));
    return toRootRelativePath(joined);
  }
  if (sourceValue.startsWith('@/')) {
    return path.posix.normalize('/src/' + sourceValue.slice(2));
  }
  if (sourceValue.startsWith('~/')) {
    return path.posix.normalize('/src/' + sourceValue.slice(2));
  }
  if (sourceValue.startsWith('src/')) {
    return path.posix.normalize('/' + sourceValue);
  }

  // Handle common scoped aliases: e.g. @components/Button, @utils/date, @hooks/useUser
  for (const prefix of COMMON_ALIAS_PREFIXES) {
    if (sourceValue === `@${prefix}` || sourceValue.startsWith(`@${prefix}/`)) {
      const rest = sourceValue.slice(prefix.length + 1);
      return path.posix.normalize(`/src/${prefix}${rest ? '/' + rest.replace(/^\//, '') : ''}`);
    }
  }

  return null; // External package import (e.g. 'react', 'lodash', '@mantine/core')
}

export interface ComponentHelperContext {
  componentRoot: string;
  componentName: string;
  folderType: string;
}

/**
 * Inspects a resolved target import path to see if it targets a component/page-scoped helper (e.g. utils/hooks).
 */
export function extractComponentHelperContext(
  resolvedPath: string,
  componentDirs: string[],
  helperFolderNames: string[]
): ComponentHelperContext | null {
  const rootRelative = toRootRelativePath(resolvedPath);
  const compDirPattern = componentDirs.join('|');
  const helperFolderPattern = helperFolderNames.join('|');

  // Matches: /src/(components|pages|...)/.../<ComponentName>/(utils|hooks)/...
  const localHelperRegex = new RegExp(
    `(.*\\/(?:${compDirPattern})(?:\\/.*?)*?\\/([^/]+))\\/(${helperFolderPattern})(?:\\/|$)`
  );

  const match = rootRelative.match(localHelperRegex);
  if (!match) {
    return null;
  }

  return {
    componentRoot: match[1],
    componentName: match[2],
    folderType: match[3],
  };
}

/**
 * Checks whether targetFilePath is inside ancestorPath or equals ancestorPath in root-relative terms.
 */
export function isDescendantOrSelf(targetFilePath: string, ancestorPath: string): boolean {
  const normalizedTarget = toRootRelativePath(targetFilePath);
  const normalizedAncestor = toRootRelativePath(ancestorPath);

  return (
    normalizedTarget === normalizedAncestor ||
    normalizedTarget.startsWith(normalizedAncestor + '/')
  );
}

/**
 * Counts the depth of upward parent directory traversal in a relative import.
 * Handles messy combinations like "./../../", ".././../" by normalizing first.
 * e.g. "./foo" => 0, "../foo" => 1, "../../foo" => 2, "../../../foo" => 3
 */
export function countRelativeParentDepth(sourceValue: string): number {
  if (!sourceValue.startsWith('.')) {
    return 0;
  }

  const normalized = path.posix.normalize(sourceValue);
  const parts = normalized.split('/');
  let depth = 0;
  for (const part of parts) {
    if (part === '..') {
      depth++;
    } else if (part !== '.') {
      break;
    }
  }
  return depth;
}

/**
 * Determines which architectural layer a given file path belongs to.
 */
export function getFileLayer(
  filePath: string,
  sharedLayers: string[],
  uiLayers: string[]
): { layer: string; type: 'shared' | 'ui' } | null {
  const rootRelative = toRootRelativePath(filePath);

  // Check root shared layers: e.g. /src/utils/..., /src/hooks/..., /src/types/...
  for (const shared of sharedLayers) {
    const sharedPattern = new RegExp(`(^|\\/)src\\/${shared}(?:\\/|$)`);
    if (sharedPattern.test(rootRelative)) {
      return { layer: shared, type: 'shared' };
    }
  }

  // Check UI layers: e.g. /src/components/..., /src/pages/..., /src/views/..., /src/app/...
  for (const ui of uiLayers) {
    const uiPattern = new RegExp(`(^|\\/)src\\/${ui}(?:\\/|$)`);
    if (uiPattern.test(rootRelative)) {
      return { layer: ui, type: 'ui' };
    }
  }

  return null;
}

export interface ExtractedImportSource {
  source: string;
  isTypeOnly: boolean;
  node: TSESTree.Node;
}

/**
 * Robustly extracts static import source string and type-only status across all AST syntax forms:
 * - ImportDeclaration (named, default, namespace, side-effect, type-only, inline specifier types)
 * - ExportNamedDeclaration & ExportAllDeclaration (with source, type-only)
 * - Dynamic import() (String literals and static TemplateLiterals)
 * - require('...') CallExpressions
 * - TSImportEqualsDeclaration (import foo = require('...'))
 */
export function extractImportFromNode(node: TSESTree.Node): ExtractedImportSource | null {
  if (node.type === AST_NODE_TYPES.ImportDeclaration) {
    if (!node.source || typeof node.source.value !== 'string') return null;
    const isGlobalType = node.importKind === 'type';
    const isAllSpecifiersType =
      node.specifiers.length > 0 &&
      node.specifiers.every((s) => (s as any).importKind === 'type');

    return {
      source: node.source.value,
      isTypeOnly: isGlobalType || isAllSpecifiersType,
      node,
    };
  }

  if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
    if (!node.source || typeof node.source.value !== 'string') return null;
    const isGlobalType = node.exportKind === 'type';
    const isAllSpecifiersType =
      node.specifiers.length > 0 &&
      node.specifiers.every((s) => (s as any).exportKind === 'type');

    return {
      source: node.source.value,
      isTypeOnly: isGlobalType || isAllSpecifiersType,
      node,
    };
  }

  if (node.type === AST_NODE_TYPES.ExportAllDeclaration) {
    if (!node.source || typeof node.source.value !== 'string') return null;
    return {
      source: node.source.value,
      isTypeOnly: node.exportKind === 'type',
      node,
    };
  }

  if (node.type === AST_NODE_TYPES.ImportExpression) {
    if (node.source.type === AST_NODE_TYPES.Literal && typeof node.source.value === 'string') {
      return {
        source: node.source.value,
        isTypeOnly: false,
        node,
      };
    }
    if (
      node.source.type === AST_NODE_TYPES.TemplateLiteral &&
      node.source.quasis.length === 1 &&
      node.source.expressions.length === 0
    ) {
      const cooked = node.source.quasis[0].value.cooked;
      if (typeof cooked === 'string') {
        return {
          source: cooked,
          isTypeOnly: false,
          node,
        };
      }
    }
    return null;
  }

  if (node.type === AST_NODE_TYPES.CallExpression) {
    if (
      node.callee.type === AST_NODE_TYPES.Identifier &&
      node.callee.name === 'require' &&
      node.arguments.length === 1 &&
      node.arguments[0].type === AST_NODE_TYPES.Literal &&
      typeof node.arguments[0].value === 'string'
    ) {
      return {
        source: node.arguments[0].value,
        isTypeOnly: false,
        node,
      };
    }
    return null;
  }

  if (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
    if (
      node.moduleReference.type === AST_NODE_TYPES.TSExternalModuleReference &&
      node.moduleReference.expression.type === AST_NODE_TYPES.Literal &&
      typeof node.moduleReference.expression.value === 'string'
    ) {
      return {
        source: node.moduleReference.expression.value,
        isTypeOnly: false,
        node,
      };
    }
    return null;
  }

  return null;
}
