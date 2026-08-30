import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as path from 'path';

type MessageIds =
  | 'multipleExports'
  | 'noDefaultExport'
  | 'bannedFileName'
  | 'fileNameMismatch';

export interface UtilHookSingleExportOptions {
  maxExports?: number;
  allowDefaultExport?: boolean;
  allowTypeExports?: boolean;
  enforceFileNameMatch?: boolean;
  bannedFileNamePatterns?: string[];
  includePaths?: string[];
  ignoreFiles?: string[];
}

type Options = [UtilHookSingleExportOptions?];

const DEFAULT_OPTIONS: Required<UtilHookSingleExportOptions> = {
  maxExports: 1,
  allowDefaultExport: false,
  allowTypeExports: true,
  enforceFileNameMatch: true,
  bannedFileNamePatterns: [
    '*Utils.ts',
    '*Utils.tsx',
    '*Helper.ts',
    '*Helpers.ts',
    '*Hooks.ts',
    'helpers.ts',
    'helpers.tsx',
    'utils.ts',
    'utils.tsx',
  ],
  includePaths: ['**/utils/**', '**/hooks/**'],
  ignoreFiles: [
    'index.ts',
    'index.tsx',
    'index.js',
    'index.jsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.test.js',
    '**/*.test.jsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.spec.js',
    '**/*.spec.jsx',
    '**/__tests__/**',
  ],
};

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function isUtilOrHookFile(filePath: string): boolean {
  const normalized = normalizePath(filePath);
  return /(^|\/)(utils|hooks)(\/|$)/.test(normalized);
}

function isIgnoredFile(filePath: string): boolean {
  const normalized = normalizePath(filePath);
  const baseName = path.basename(normalized);

  if (/^index\.[jt]sx?$/.test(baseName)) {
    return true;
  }

  if (/\.(test|spec)\.[jt]sx?$/.test(baseName)) {
    return true;
  }

  if (normalized.includes('/__tests__/')) {
    return true;
  }

  return false;
}

function matchesBannedPattern(baseName: string): { isBanned: boolean; suggestedFolder: string } {
  const cleanName = baseName.replace(/\.[jt]sx?$/, '');

  if (/^(utils|helpers|hooks)$/i.test(cleanName)) {
    return { isBanned: true, suggestedFolder: 'common' };
  }

  const match = cleanName.match(/^(.*?)(Utils|Helpers|Helper|Hooks)$/i);
  if (match) {
    const prefix = match[1];
    const suggestedFolder = prefix
      ? prefix.charAt(0).toLowerCase() + prefix.slice(1)
      : 'common';
    return { isBanned: true, suggestedFolder };
  }

  return { isBanned: false, suggestedFolder: '' };
}

function getExportedNamesFromPattern(pattern: TSESTree.BindingName): string[] {
  const names: string[] = [];
  if (pattern.type === AST_NODE_TYPES.Identifier) {
    names.push(pattern.name);
  } else if (pattern.type === AST_NODE_TYPES.ObjectPattern) {
    for (const property of pattern.properties) {
      if (property.type === AST_NODE_TYPES.Property) {
        names.push(...getExportedNamesFromPattern(property.value as TSESTree.BindingName));
      } else if (property.type === AST_NODE_TYPES.RestElement) {
        names.push(...getExportedNamesFromPattern(property.argument as TSESTree.BindingName));
      }
    }
  } else if (pattern.type === AST_NODE_TYPES.ArrayPattern) {
    for (const element of pattern.elements) {
      if (element) {
        if (element.type === AST_NODE_TYPES.RestElement) {
          names.push(...getExportedNamesFromPattern(element.argument as TSESTree.BindingName));
        } else {
          names.push(...getExportedNamesFromPattern(element as TSESTree.BindingName));
        }
      }
    }
  }
  return names;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforces Single Responsibility for utils and hooks: at most one exported function/hook per file, forbids collector files and default exports, and ensures file name matches export.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxExports: { type: 'number', minimum: 1 },
          allowDefaultExport: { type: 'boolean' },
          allowTypeExports: { type: 'boolean' },
          enforceFileNameMatch: { type: 'boolean' },
          bannedFileNamePatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          includePaths: {
            type: 'array',
            items: { type: 'string' },
          },
          ignoreFiles: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      multipleExports:
        'Util and hook files must follow the Single Responsibility principle: only {{maxExports}} export is allowed per file. Found {{count}} exports ({{names}}).',
      noDefaultExport:
        'Default export is not allowed in util/hook files. Use a named export matching the file name.',
      bannedFileName:
        "Collector file name '{{fileName}}' is not allowed. Group related functions in a dedicated folder (e.g. '{{suggestedFolder}}') where each file has a single responsibility.",
      fileNameMismatch:
        "Exported symbol '{{exportName}}' does not match the file name '{{expectedName}}'.",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<UtilHookSingleExportOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const filename = context.filename ?? context.getFilename();
    if (!filename || filename === '<input>' || filename === '<text>') {
      return {};
    }

    const normalizedPath = normalizePath(filename);

    if (!isUtilOrHookFile(normalizedPath) || isIgnoredFile(normalizedPath)) {
      return {};
    }

    const baseName = path.basename(normalizedPath);
    const expectedExportName = baseName.replace(/\.[jt]sx?$/, '');

    const exportedItems: Array<{
      name: string;
      node: TSESTree.Node;
    }> = [];

    let defaultExportNode: TSESTree.ExportDefaultDeclaration | null = null;

    let hasBannedFileNameError = false;

    return {
      Program(node) {
        const bannedCheck = matchesBannedPattern(baseName);
        if (bannedCheck.isBanned) {
          hasBannedFileNameError = true;
          context.report({
            node,
            messageId: 'bannedFileName',
            data: {
              fileName: baseName,
              suggestedFolder: bannedCheck.suggestedFolder,
            },
          });
        }
      },

      ExportDefaultDeclaration(node) {
        defaultExportNode = node;
        if (!options.allowDefaultExport) {
          context.report({
            node,
            messageId: 'noDefaultExport',
          });
        } else {
          exportedItems.push({
            name: 'default',
            node,
          });
        }
      },

      ExportNamedDeclaration(node) {
        if (node.exportKind === 'type' && options.allowTypeExports) {
          return;
        }

        if (node.declaration) {
          const decl = node.declaration;

          if (
            (decl.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
              decl.type === AST_NODE_TYPES.TSInterfaceDeclaration) &&
            options.allowTypeExports
          ) {
            return;
          }

          if (decl.type === AST_NODE_TYPES.FunctionDeclaration && decl.id) {
            exportedItems.push({
              name: decl.id.name,
              node: decl,
            });
          } else if (decl.type === AST_NODE_TYPES.ClassDeclaration && decl.id) {
            exportedItems.push({
              name: decl.id.name,
              node: decl,
            });
          } else if (decl.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declarator of decl.declarations) {
              const names = getExportedNamesFromPattern(declarator.id);
              for (const name of names) {
                exportedItems.push({
                  name,
                  node: declarator,
                });
              }
            }
          } else if (
            decl.type === AST_NODE_TYPES.TSEnumDeclaration ||
            decl.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
            decl.type === AST_NODE_TYPES.TSInterfaceDeclaration
          ) {
            const declWithId = decl as any;
            if (declWithId.id) {
              exportedItems.push({
                name: declWithId.id.name,
                node: decl,
              });
            }
          }
        }

        if (node.specifiers && node.specifiers.length > 0) {
          for (const specifier of node.specifiers) {
            if (specifier.exportKind === 'type' && options.allowTypeExports) {
              continue;
            }
            const exportedName =
              specifier.exported.type === AST_NODE_TYPES.Identifier
                ? specifier.exported.name
                : (specifier.exported as any).value;

            exportedItems.push({
              name: exportedName,
              node: specifier,
            });
          }
        }
      },

      'Program:exit'() {
        const totalCount = exportedItems.length;

        if (totalCount > options.maxExports) {
          const names = exportedItems.map((item) => item.name).join(', ');
          // Report on the first export node or the container
          const targetNode = exportedItems[0]?.node ?? defaultExportNode;
          if (targetNode) {
            context.report({
              node: targetNode,
              messageId: 'multipleExports',
              data: {
                maxExports: String(options.maxExports),
                count: String(totalCount),
                names,
              },
            });
          }
          return;
        }

        if (
          options.enforceFileNameMatch &&
          !hasBannedFileNameError &&
          totalCount === 1 &&
          !defaultExportNode
        ) {
          const singleExport = exportedItems[0];
          if (singleExport && singleExport.name !== expectedExportName) {
            context.report({
              node: singleExport.node,
              messageId: 'fileNameMismatch',
              data: {
                exportName: singleExport.name,
                expectedName: expectedExportName,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
