import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as path from 'path';

type MessageIds = 'singleComponentExport';
type Options = [];

function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

function unwrapExpression(node: TSESTree.Node | null | undefined): TSESTree.Node | null | undefined {
  let current = node;
  while (current) {
    if (
      current.type === AST_NODE_TYPES.TSAsExpression ||
      current.type === AST_NODE_TYPES.TSTypeAssertion ||
      current.type === AST_NODE_TYPES.TSNonNullExpression ||
      (current as any).type === 'TSSatisfiesExpression' ||
      (current as any).type === 'ParenthesizedExpression'
    ) {
      current = (current as any).expression;
    } else {
      break;
    }
  }
  return current;
}

function isComponentWrapperCall(node: TSESTree.Node): boolean {
  const unwrapped = unwrapExpression(node);
  if (!unwrapped || unwrapped.type !== AST_NODE_TYPES.CallExpression) return false;
  const callee = unwrapExpression(unwrapped.callee);
  if (!callee) return false;

  // React.memo, React.forwardRef, React.lazy
  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    callee.object.type === AST_NODE_TYPES.Identifier &&
    callee.object.name === 'React' &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    ['memo', 'forwardRef', 'lazy'].includes(callee.property.name)
  ) {
    return true;
  }

  // memo, forwardRef, lazy
  if (
    callee.type === AST_NODE_TYPES.Identifier &&
    ['memo', 'forwardRef', 'lazy'].includes(callee.name)
  ) {
    return true;
  }

  return false;
}

function isFunctionOrComponent(node: TSESTree.Node | null | undefined): boolean {
  const unwrapped = unwrapExpression(node);
  if (!unwrapped) return false;
  if (
    unwrapped.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    unwrapped.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return true;
  }
  if (isComponentWrapperCall(unwrapped)) {
    return true;
  }
  return false;
}

function isIgnoredFile(filename: string): boolean {
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

  return false;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that each component file exports at most one React component.',
    },
    schema: [],
    messages: {
      singleComponentExport:
        "Only one component can be exported per component file. '{{componentName}}' is exported in excess.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      if (isIgnoredFile(filename)) {
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
          if (isFunctionOrComponent(node.init)) {
            localComponentDeclarations.set(node.id.name, node);
          }
        }
      },

      ExportNamedDeclaration(node) {
        // External re-exports: export { X } from './other' are ignored
        if (node.source) {
          return;
        }

        // Type-only exports: export type { ... } are ignored
        if (node.exportKind === 'type') {
          return;
        }

        if (node.declaration) {
          const decl = node.declaration;

          // Type alias, interface, and enum declarations are ignored
          if (
            decl.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
            decl.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
            decl.type === AST_NODE_TYPES.TSEnumDeclaration
          ) {
            return;
          }

          // export function MyComponent() {}
          if (decl.type === AST_NODE_TYPES.FunctionDeclaration && decl.id) {
            if (isPascalCase(decl.id.name)) {
              directExportedComponents.push({
                name: decl.id.name,
                node: decl.id,
              });
            }
          }

          // export class MyComponent extends React.Component {}
          if (decl.type === AST_NODE_TYPES.ClassDeclaration && decl.id) {
            if (isPascalCase(decl.id.name)) {
              directExportedComponents.push({
                name: decl.id.name,
                node: decl.id,
              });
            }
          }

          // export const MyComponent = () => {}
          if (decl.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declarator of decl.declarations) {
              if (
                declarator.id.type === AST_NODE_TYPES.Identifier &&
                isPascalCase(declarator.id.name)
              ) {
                if (isFunctionOrComponent(declarator.init)) {
                  directExportedComponents.push({
                    name: declarator.id.name,
                    node: declarator.id,
                  });
                }
              }
            }
          }
        }

        // export { A, B }
        if (node.specifiers && node.specifiers.length > 0) {
          for (const specifier of node.specifiers) {
            if (specifier.exportKind !== 'type') {
              rawExportSpecifiers.push(specifier);
            }
          }
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
          const exportedName =
            specifier.exported.type === AST_NODE_TYPES.Identifier
              ? specifier.exported.name
              : (specifier.exported as any).value;

          // If it's an imported identifier re-exported locally, skip it
          if (importedNames.has(localName)) {
            continue;
          }

          // If the local symbol is a recognized local component declaration or PascalCase component
          if (localComponentDeclarations.has(localName) && isPascalCase(exportedName)) {
            allExportedComponents.push({
              name: exportedName,
              node: specifier,
            });
          }
        }

        // Sort by AST range start position to maintain accurate export order in the file
        allExportedComponents.sort((a, b) => a.node.range[0] - b.node.range[0]);

        if (allExportedComponents.length > 1) {
          // The first component is valid; flag all subsequent exported components
          for (let i = 1; i < allExportedComponents.length; i++) {
            const extraComponent = allExportedComponents[i];
            context.report({
              node: extraComponent.node,
              messageId: 'singleComponentExport',
              data: {
                componentName: extraComponent.name,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
