import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isPascalCase,
  functionBodyReturnsJSX,
  unwrapExpression,
  matchesIgnorePattern,
} from '../../utils/ast-helpers';

type MessageIds = 'invalidPropType';

export interface ReactComponentPropsNamingOptions {
  suffix?: string;
  allowGenericProps?: boolean;
  ignoreComponents?: string[];
  ignorePatterns?: string[];
}

type Options = [ReactComponentPropsNamingOptions?];

const DEFAULT_OPTIONS: Required<ReactComponentPropsNamingOptions> = {
  suffix: 'Props',
  allowGenericProps: false,
  ignoreComponents: [],
  ignorePatterns: [
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.stories.*',
    '**/__tests__/**',
  ],
};

function isBuiltInOrIgnoredType(typeNode: TSESTree.TypeNode): boolean {
  if (
    typeNode.type === AST_NODE_TYPES.TSAnyKeyword ||
    typeNode.type === AST_NODE_TYPES.TSUnknownKeyword ||
    typeNode.type === AST_NODE_TYPES.TSObjectKeyword ||
    typeNode.type === AST_NODE_TYPES.TSNeverKeyword ||
    typeNode.type === AST_NODE_TYPES.TSNullKeyword ||
    typeNode.type === AST_NODE_TYPES.TSUndefinedKeyword ||
    typeNode.type === AST_NODE_TYPES.TSVoidKeyword ||
    typeNode.type === AST_NODE_TYPES.TSStringKeyword ||
    typeNode.type === AST_NODE_TYPES.TSNumberKeyword ||
    typeNode.type === AST_NODE_TYPES.TSBooleanKeyword ||
    typeNode.type === AST_NODE_TYPES.TSSymbolKeyword ||
    typeNode.type === AST_NODE_TYPES.TSBigIntKeyword ||
    typeNode.type === AST_NODE_TYPES.TSTypeLiteral ||
    typeNode.type === AST_NODE_TYPES.TSTupleType ||
    typeNode.type === AST_NODE_TYPES.TSArrayType
  ) {
    return true;
  }

  if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
    const typeName = getTypeNameString(typeNode);
    if (
      typeName === 'Record' ||
      typeName.includes('HTMLAttributes') ||
      typeName.includes('ComponentProps') ||
      typeName.startsWith('React.') ||
      typeName.startsWith('JSX.')
    ) {
      return true;
    }
  }

  return false;
}

function getTypeNameString(node: TSESTree.Node): string {
  if (node.type === AST_NODE_TYPES.TSTypeReference) {
    if (node.typeName.type === AST_NODE_TYPES.Identifier) {
      return node.typeName.name;
    }
    if (node.typeName.type === AST_NODE_TYPES.TSQualifiedName) {
      return `${getTypeNameString(node.typeName.left as any)}.${node.typeName.right.name}`;
    }
  }
  if (node.type === AST_NODE_TYPES.Identifier) {
    return node.name;
  }
  return '';
}

function isPropsWithChildren(node: TSESTree.TypeNode): boolean {
  if (node.type === AST_NODE_TYPES.TSTypeReference) {
    const name = getTypeNameString(node);
    return name === 'PropsWithChildren' || name === 'React.PropsWithChildren';
  }
  return false;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{}],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce {ComponentName}Props naming convention for React component props.',
      recommended: true,
    } as any,
    messages: {
      invalidPropType:
        "Component '{{componentName}}' props type must be '{{componentName}}Props' instead of '{{actualType}}'.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          suffix: {
            type: 'string',
            description: "Suffix expected on the prop type (default: 'Props').",
          },
          allowGenericProps: {
            type: 'boolean',
            description: "If true, allows generic 'Props' or 'TProps' as valid prop types.",
          },
          ignoreComponents: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of component names to ignore.',
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
  },
  create(context) {
    const customOptions = context.options[0] || {};
    const options: Required<ReactComponentPropsNamingOptions> = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    };

    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      const normalized = filename.replace(/\\/g, '/');
      if (!normalized.endsWith('.tsx')) {
        return {};
      }
      if (
        normalized.endsWith('.test.tsx') ||
        normalized.endsWith('.spec.tsx') ||
        normalized.includes('/__tests__/') ||
        matchesIgnorePattern(normalized, options.ignorePatterns)
      ) {
        return {};
      }
      if (normalized.includes('/apis/')) {
        return {};
      }
    }

    const expectedSuffix = options.suffix || 'Props';

    function checkTypeNode(
      typeNode: TSESTree.TypeNode,
      componentName: string,
      reportNode: TSESTree.Node
    ) {
      if (options.ignoreComponents.includes(componentName)) {
        return;
      }

      const expectedPropsName = `${componentName}${expectedSuffix}`;

      if (typeNode.type === AST_NODE_TYPES.TSTypeLiteral) {
        return;
      }

      if (isBuiltInOrIgnoredType(typeNode)) {
        return;
      }

      if (isPropsWithChildren(typeNode)) {
        const typeParams = (typeNode as TSESTree.TSTypeReference).typeArguments?.params;
        if (typeParams && typeParams.length > 0) {
          checkTypeNode(typeParams[0], componentName, reportNode);
        }
        return;
      }

      if (typeNode.type === AST_NODE_TYPES.TSIntersectionType) {
        for (const member of typeNode.types) {
          if (member.type === AST_NODE_TYPES.TSTypeReference) {
            const typeName = getTypeNameString(member);
            if (!isBuiltInOrIgnoredType(member)) {
              if (
                typeName !== expectedPropsName &&
                (!options.allowGenericProps || (typeName !== 'Props' && typeName !== 'TProps'))
              ) {
                context.report({
                  node: reportNode,
                  messageId: 'invalidPropType',
                  data: {
                    componentName,
                    actualType: typeName,
                  },
                });
              }
              return;
            }
          }
        }
        return;
      }

      if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
        const actualType = getTypeNameString(typeNode);
        if (
          actualType !== expectedPropsName &&
          (!options.allowGenericProps || (actualType !== 'Props' && actualType !== 'TProps'))
        ) {
          context.report({
            node: reportNode,
            messageId: 'invalidPropType',
            data: {
              componentName,
              actualType,
            },
          });
        }
      }
    }

    function checkComponentProps(
      params: TSESTree.Parameter[],
      componentName: string,
      typeAnnotationNode?: TSESTree.TypeNode | null
    ) {
      if (params.length === 0) return;

      const firstParam = params[0];

      if ('typeAnnotation' in firstParam && firstParam.typeAnnotation) {
        checkTypeNode(
          firstParam.typeAnnotation.typeAnnotation,
          componentName,
          firstParam.typeAnnotation
        );
      }
    }

    function checkFCAnnotation(
      typeAnnotation: TSESTree.TSTypeAnnotation | undefined,
      componentName: string,
      node: TSESTree.Node
    ) {
      if (!typeAnnotation) return;
      const typeNode = typeAnnotation.typeAnnotation;

      if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
        const typeName = getTypeNameString(typeNode);
        if (
          typeName === 'FC' ||
          typeName === 'React.FC' ||
          typeName === 'FunctionComponent' ||
          typeName === 'React.FunctionComponent'
        ) {
          const typeParams = typeNode.typeArguments?.params;
          if (typeParams && typeParams.length > 0) {
            checkTypeNode(typeParams[0], componentName, typeParams[0]);
          }
        }
      }
    }

    return {
      FunctionDeclaration(node) {
        if (!node.id || !isPascalCase(node.id.name)) return;
        if (!functionBodyReturnsJSX(node.body)) return;
        checkComponentProps(node.params, node.id.name);
      },

      VariableDeclarator(node) {
        if (node.id.type !== AST_NODE_TYPES.Identifier || !isPascalCase(node.id.name)) {
          return;
        }
        const componentName = node.id.name;

        // Check FC / React.FC type annotation on the variable identifier
        if (node.id.typeAnnotation) {
          checkFCAnnotation(node.id.typeAnnotation, componentName, node.id);
        }

        if (!node.init) return;
        const unwrapped = unwrapExpression(node.init);
        if (!unwrapped) return;

        // Check React.memo or React.forwardRef call
        if (unwrapped.type === AST_NODE_TYPES.CallExpression) {
          const callee = unwrapped.callee;
          let isMemo = false;
          let isForwardRef = false;

          if (callee.type === AST_NODE_TYPES.Identifier) {
            if (callee.name === 'memo') isMemo = true;
            if (callee.name === 'forwardRef') isForwardRef = true;
          } else if (
            callee.type === AST_NODE_TYPES.MemberExpression &&
            callee.object.type === AST_NODE_TYPES.Identifier &&
            callee.object.name === 'React' &&
            callee.property.type === AST_NODE_TYPES.Identifier
          ) {
            if (callee.property.name === 'memo') isMemo = true;
            if (callee.property.name === 'forwardRef') isForwardRef = true;
          }

          if (isMemo || isForwardRef) {
            const innerFn = unwrapped.arguments[0];
            if (
              innerFn &&
              (innerFn.type === AST_NODE_TYPES.ArrowFunctionExpression ||
                innerFn.type === AST_NODE_TYPES.FunctionExpression)
            ) {
              if (!functionBodyReturnsJSX(innerFn.body)) return;

              if (isForwardRef) {
                const typeArgs = (unwrapped as any).typeArguments?.params;
                if (typeArgs && typeArgs.length >= 2) {
                  const propsTypeNode = typeArgs[1];
                  checkTypeNode(propsTypeNode, componentName, propsTypeNode);
                  return;
                }
              }

              if (innerFn.params.length > 0) {
                checkComponentProps(innerFn.params, componentName);
              }
            }
          }
          return;
        }

        if (
          unwrapped.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          unwrapped.type === AST_NODE_TYPES.FunctionExpression
        ) {
          if (functionBodyReturnsJSX(unwrapped.body)) {
            checkComponentProps(unwrapped.params, componentName);
          }
        }
      },
    };
  },
};

export default rule;
