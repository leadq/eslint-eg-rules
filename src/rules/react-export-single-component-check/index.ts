import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as path from 'path';
import {
  isPascalCase,
  isFunctionOrCallable,
  matchesIgnorePattern,
} from '../../utils/ast-helpers';

type MessageIds = 'singleComponentExport';

export interface ReactExportSingleComponentOptions {
  compound?: boolean;
  ignorePatterns?: string[];
}

type Options = [ReactExportSingleComponentOptions?];

const DEFAULT_OPTIONS: Required<ReactExportSingleComponentOptions> = {
  compound: false,
  ignorePatterns: [
    '**/*.stories.*',
    '**/*.story.*',
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
  ],
};

function isIgnoredFile(filename: string, ignorePatterns: string[]): boolean {
  const normalized = filename.replace(/\\/g, '/');
  if (!normalized.toLowerCase().endsWith('.tsx')) {
    return true;
  }

  const baseName = path.basename(normalized);

  if (
    baseName === 'index.tsx' ||
    baseName === 'main.tsx' ||
    baseName === 'App.tsx' ||
    baseName.endsWith('.stories.tsx') ||
    baseName.endsWith('.story.tsx') ||
    baseName.endsWith('.test.tsx') ||
    baseName.endsWith('.spec.tsx') ||
    normalized.includes('/__tests__/')
  ) {
    return true;
  }

  return matchesIgnorePattern(normalized, ignorePatterns);
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that each component file exports at most one React component.',
      recommended: true,
    } as any,
    schema: [
      {
        type: 'object',
        properties: {
          compound: {
            type: 'boolean',
            description: 'If true, allows exporting compound subcomponents that share the primary component name prefix (e.g. Card and CardHeader).',
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
      singleComponentExport:
        "Only one component can be exported per component file. '{{componentName}}' is exported in excess.",
    },
  },
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<ReactExportSingleComponentOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      if (isIgnoredFile(filename, options.ignorePatterns)) {
        return {};
      }
    }

    const importedNames = new Set<string>();
    const localComponentDeclarations = new Map<string, TSESTree.Node>();
    const rawExportSpecifiers: TSESTree.ExportSpecifier[] = [];
    const directExportedComponents: Array<{
      name: string;
      node: TSESTree.Node;
    }> = [];

    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          importedNames.add(specifier.local.name);
        }
      },

      FunctionDeclaration(node) {
        if (node.id && isPascalCase(node.id.name)) {
          localComponentDeclarations.set(node.id.name, node);
        }
      },

      ClassDeclaration(node) {
        if (node.id && isPascalCase(node.id.name)) {
          localComponentDeclarations.set(node.id.name, node);
        }
      },

      VariableDeclarator(node) {
        if (node.id.type === AST_NODE_TYPES.Identifier && isPascalCase(node.id.name)) {
          if (isFunctionOrCallable(node.init)) {
            localComponentDeclarations.set(node.id.name, node);
          }
        }
      },

      ExportNamedDeclaration(node) {
        if (node.source) {
          return;
        }

        if (node.exportKind === 'type') {
          return;
        }

        if (node.declaration) {
          const decl = node.declaration;

          if (decl.type === AST_NODE_TYPES.FunctionDeclaration && decl.id) {
            if (isPascalCase(decl.id.name)) {
              directExportedComponents.push({
                name: decl.id.name,
                node: decl,
              });
            }
          } else if (decl.type === AST_NODE_TYPES.ClassDeclaration && decl.id) {
            if (isPascalCase(decl.id.name)) {
              directExportedComponents.push({
                name: decl.id.name,
                node: decl,
              });
            }
          } else if (decl.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declarator of decl.declarations) {
              if (
                declarator.id.type === AST_NODE_TYPES.Identifier &&
                isPascalCase(declarator.id.name)
              ) {
                if (isFunctionOrCallable(declarator.init)) {
                  directExportedComponents.push({
                    name: declarator.id.name,
                    node: declarator,
                  });
                }
              }
            }
          }
        }

        if (node.specifiers && node.specifiers.length > 0) {
          for (const specifier of node.specifiers) {
            if (specifier.exportKind === 'type') {
              continue;
            }
            rawExportSpecifiers.push(specifier);
          }
        }
      },

      ExportDefaultDeclaration(node) {
        const decl = node.declaration;

        if (
          (decl.type === AST_NODE_TYPES.FunctionDeclaration ||
            decl.type === AST_NODE_TYPES.ClassDeclaration) &&
          decl.id
        ) {
          if (isPascalCase(decl.id.name)) {
            directExportedComponents.push({
              name: decl.id.name,
              node: decl,
            });
          }
        } else if (decl.type === AST_NODE_TYPES.Identifier) {
          if (
            isPascalCase(decl.name) &&
            !importedNames.has(decl.name) &&
            localComponentDeclarations.has(decl.name)
          ) {
            directExportedComponents.push({
              name: decl.name,
              node,
            });
          }
        } else if (isFunctionOrCallable(decl)) {
          directExportedComponents.push({
            name: 'default',
            node,
          });
        }
      },

      'Program:exit'() {
        const allExportedComponents: Array<{
          name: string;
          node: TSESTree.Node;
        }> = [...directExportedComponents];

        for (const specifier of rawExportSpecifiers) {
          const localName =
            specifier.local.type === AST_NODE_TYPES.Identifier
              ? specifier.local.name
              : (specifier.local as any).value;
          if (
            localName &&
            isPascalCase(localName) &&
            !importedNames.has(localName) &&
            localComponentDeclarations.has(localName)
          ) {
            allExportedComponents.push({
              name: localName,
              node: specifier,
            });
          }
        }

        if (allExportedComponents.length <= 1) {
          return;
        }

        // When compound option is enabled, check if secondary exports are compound children of the primary component
        if (options.compound) {
          const primaryComponent = allExportedComponents[0];
          const nonCompoundComponents = allExportedComponents.slice(1).filter((comp) => {
            // A compound component starts with the primary component's name (e.g. CardHeader for Card)
            return !comp.name.startsWith(primaryComponent.name);
          });

          for (const comp of nonCompoundComponents) {
            context.report({
              node: comp.node,
              messageId: 'singleComponentExport',
              data: {
                componentName: comp.name,
              },
            });
          }
          return;
        }

        // Default strict behavior: report all components after the first
        for (let i = 1; i < allExportedComponents.length; i++) {
          const comp = allExportedComponents[i];
          context.report({
            node: comp.node,
            messageId: 'singleComponentExport',
            data: {
              componentName: comp.name,
            },
          });
        }
      },
    };
  },
};

export default rule;
