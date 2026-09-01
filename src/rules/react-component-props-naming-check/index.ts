import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'invalidPropType';
type Options = [];

function isPascalCase(name: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

function isJSXNode(node: TSESTree.Node | null | undefined): boolean {
  if (!node) return false;
  if (node.type === AST_NODE_TYPES.JSXElement || node.type === AST_NODE_TYPES.JSXFragment) {
    return true;
  }
  if ((node as any).type === 'ParenthesizedExpression' && (node as any).expression) {
    return isJSXNode((node as any).expression);
  }
  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    return isJSXNode(node.consequent) || isJSXNode(node.alternate);
  }
  if (node.type === AST_NODE_TYPES.LogicalExpression) {
    return isJSXNode(node.right) || isJSXNode(node.left);
  }
  return false;
}

function functionBodyReturnsJSX(body: TSESTree.Node | null | undefined): boolean {
  if (!body) return false;
  if (body.type !== AST_NODE_TYPES.BlockStatement) {
    return isJSXNode(body);
  }

  let found = false;

  function traverse(node: TSESTree.Node) {
    if (found) return;
    if (
      node.type === AST_NODE_TYPES.FunctionDeclaration ||
      node.type === AST_NODE_TYPES.FunctionExpression ||
      node.type === AST_NODE_TYPES.ArrowFunctionExpression
    ) {
      return;
    }
    if (node.type === AST_NODE_TYPES.ReturnStatement) {
      if (isJSXNode(node.argument)) {
        found = true;
      }
      return;
    }

    for (const key of Object.keys(node)) {
      if (key === 'parent') continue;
      const child = (node as any)[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              traverse(item);
            }
          }
        } else if (child.type) {
          traverse(child);
        }
      }
    }
  }

  traverse(body);
  return found;
}

function getTypeNameString(typeNode: TSESTree.TypeNode): string | null {
  if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
    if (typeNode.typeName.type === AST_NODE_TYPES.Identifier) {
      return typeNode.typeName.name;
    }
    if (typeNode.typeName.type === AST_NODE_TYPES.TSQualifiedName) {
      return typeNode.typeName.right.name;
    }
  }
  return null;
}

function isPropsWithChildren(typeNode: TSESTree.TypeNode): boolean {
  if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
    const name = getTypeNameString(typeNode);
    return name === 'PropsWithChildren';
  }
  return false;
}

function isBuiltInOrIgnoredType(typeNode: TSESTree.TypeNode): boolean {
  if (typeNode.type === AST_NODE_TYPES.TSTypeLiteral) {
    return true;
  }

  if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
    const typeName = getTypeNameString(typeNode);
    if (!typeName) return false;

    if (
      typeName === 'ComponentProps' ||
      typeName === 'ComponentPropsWithoutRef' ||
      typeName === 'ComponentPropsWithRef' ||
      typeName === 'HTMLAttributes' ||
      typeName.endsWith('HTMLAttributes') ||
      typeName.endsWith('Attributes') ||
      typeName === 'HTMLProps' ||
      typeName === 'DetailedHTMLProps' ||
      typeName === 'SVGProps' ||
      typeName === 'SVGAttributes' ||
      typeName.endsWith('SVGAttributes') ||
      typeName === 'ReactElement' ||
      typeName === 'ReactNode'
    ) {
      return true;
    }
  }
  return false;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce {ComponentName}Props naming convention for React component props.',
    },
    schema: [],
    messages: {
      invalidPropType:
        "Component '{{componentName}}' props type must be '{{componentName}}Props' instead of '{{actualType}}'.",
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (filename && filename !== '<input>' && filename !== '<text>') {
      const normalized = filename.replace(/\\/g, '/');
      if (!normalized.endsWith('.tsx')) {
        return {};
      }
      if (
        normalized.endsWith('.test.tsx') ||
        normalized.endsWith('.spec.tsx') ||
        normalized.includes('/__tests__/')
      ) {
        return {};
      }
      if (normalized.includes('/apis/')) {
        return {};
      }
    }

    function checkTypeNode(
      typeNode: TSESTree.TypeNode,
      componentName: string,
      reportNode: TSESTree.Node
    ) {
      const expectedPropsName = `${componentName}Props`;

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
        const customTypes = typeNode.types.filter((t) => !isBuiltInOrIgnoredType(t));
        if (customTypes.length === 0) {
          return;
        }

        const hasValidType = customTypes.some((t) => {
          if (t.type === AST_NODE_TYPES.TSTypeReference) {
            if (isPropsWithChildren(t)) {
              const innerParams = (t as TSESTree.TSTypeReference).typeArguments?.params;
              if (innerParams && innerParams.length > 0) {
                const innerName = getTypeNameString(innerParams[0]);
                return innerName === expectedPropsName;
              }
            }
            const name = getTypeNameString(t);
            return name === expectedPropsName;
          }
          return false;
        });

        if (hasValidType) {
          return;
        }

        const firstCustomType = customTypes[0];
        let actualTypeName = 'UnknownType';
        if (firstCustomType.type === AST_NODE_TYPES.TSTypeReference) {
          if (isPropsWithChildren(firstCustomType)) {
            const innerParams = (firstCustomType as TSESTree.TSTypeReference).typeArguments?.params;
            if (innerParams && innerParams.length > 0) {
              actualTypeName = getTypeNameString(innerParams[0]) || 'UnknownType';
            }
          } else {
            actualTypeName = getTypeNameString(firstCustomType) || 'UnknownType';
          }
        }

        context.report({
          node: reportNode,
          messageId: 'invalidPropType',
          data: {
            componentName,
            actualType: actualTypeName,
          },
        });
        return;
      }

      if (typeNode.type === AST_NODE_TYPES.TSTypeReference) {
        const typeName = getTypeNameString(typeNode);
        if (!typeName) return;

        if (typeName !== expectedPropsName) {
          context.report({
            node: reportNode,
            messageId: 'invalidPropType',
            data: {
              componentName,
              actualType: typeName,
            },
          });
        }
      }
    }

    function checkParamType(
      param: TSESTree.Node | undefined,
      componentName: string
    ) {
      if (!param) return;
      if ('typeAnnotation' in param && param.typeAnnotation) {
        const typeAnn = param.typeAnnotation as TSESTree.TSTypeAnnotation;
        if (typeAnn && typeAnn.typeAnnotation) {
          checkTypeNode(typeAnn.typeAnnotation, componentName, typeAnn);
        }
      }
    }

    return {
      FunctionDeclaration(node) {
        if (!node.id || !isPascalCase(node.id.name)) return;
        const componentName = node.id.name;

        if (!functionBodyReturnsJSX(node.body)) return;

        if (node.params.length === 0) return;
        checkParamType(node.params[0], componentName);
      },

      VariableDeclarator(node) {
        if (node.id.type !== AST_NODE_TYPES.Identifier || !isPascalCase(node.id.name)) return;
        const componentName = node.id.name;

        if (!node.init) return;

        // Check React.FC<Props> or FC<Props>
        if (node.id.typeAnnotation?.type === AST_NODE_TYPES.TSTypeAnnotation) {
          const typeRef = node.id.typeAnnotation.typeAnnotation;
          if (typeRef.type === AST_NODE_TYPES.TSTypeReference) {
            const isFC =
              (typeRef.typeName.type === AST_NODE_TYPES.Identifier &&
                typeRef.typeName.name === 'FC') ||
              (typeRef.typeName.type === AST_NODE_TYPES.TSQualifiedName &&
                typeRef.typeName.left.type === AST_NODE_TYPES.Identifier &&
                typeRef.typeName.left.name === 'React' &&
                typeRef.typeName.right.type === AST_NODE_TYPES.Identifier &&
                typeRef.typeName.right.name === 'FC');

            if (isFC) {
              const typeParams = typeRef.typeArguments?.params;
              if (typeParams && typeParams.length > 0) {
                if (
                  (node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
                    node.init.type === AST_NODE_TYPES.FunctionExpression) &&
                  functionBodyReturnsJSX(node.init.body)
                ) {
                  checkTypeNode(typeParams[0], componentName, typeParams[0]);
                  return;
                }
              }
            }
          }
        }

        // Direct function or arrow function
        if (
          node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          node.init.type === AST_NODE_TYPES.FunctionExpression
        ) {
          if (!functionBodyReturnsJSX(node.init.body)) return;

          if (node.init.params.length > 0) {
            checkParamType(node.init.params[0], componentName);
          }
          return;
        }

        // React.memo or React.forwardRef
        if (node.init.type === AST_NODE_TYPES.CallExpression) {
          const callee = node.init.callee;
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
            const innerFn = node.init.arguments[0];
            if (
              innerFn &&
              (innerFn.type === AST_NODE_TYPES.ArrowFunctionExpression ||
                innerFn.type === AST_NODE_TYPES.FunctionExpression)
            ) {
              if (!functionBodyReturnsJSX(innerFn.body)) return;

              if (isForwardRef) {
                const typeArgs = (node.init as any).typeArguments?.params;
                if (typeArgs && typeArgs.length >= 2) {
                  const propsTypeNode = typeArgs[1];
                  checkTypeNode(propsTypeNode, componentName, propsTypeNode);
                  return;
                }
              }

              if (innerFn.params.length > 0) {
                checkParamType(innerFn.params[0], componentName);
              }
            }
          }
        }
      },
    };
  },
};

export default rule;
