import { Rule } from 'eslint';
import {
  Node,
  CallExpression,
  Identifier,
  ReturnStatement,
  IfStatement,
  VariableDeclaration,
  FunctionDeclaration,
  ExpressionStatement,
} from 'estree';
import { TSESTree } from '@typescript-eslint/utils';

export const reactComponentLayoutRule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description:
        'Enforce chronological layout grouping inside React Components for better readability.',
      category: 'Stylistic Issues',
      recommended: true,
    },
    messages: {
      order:
        '[React Layout] Sequence Violation: "{{current_name}}" (Group: {{current_group}}) is declared after "{{prev_name}}" (Group: {{prev_group}}). -> FIX: Move "{{current_name}}" ABOVE "{{prev_name}}" to respect the correct chronological component layout sequence.',
      contiguous:
        '[React Layout] Contiguous Violation: All declarations of type "{{current_name}}" must be strictly grouped together. -> FIX: Move this statement so it sits directly adjacent to the other "{{current_name}}" declarations, closing the gap.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    function isInsideJSXOrReturn(node: Node, rootNode: Node): boolean {
      let curr: any = node;
      while (curr && curr !== rootNode) {
        if (
          curr.type === 'JSXElement' ||
          curr.type === 'JSXFragment' ||
          curr.type === 'ReturnStatement'
        ) {
          return true;
        }
        curr = curr.parent;
      }
      return false;
    }

    function getHookName(initNode: any): string | null {
      if (!initNode) return null;
      if (initNode.type === 'CallExpression') {
        if (initNode.callee.type === 'Identifier') return initNode.callee.name;
        if (
          initNode.callee.type === 'MemberExpression' &&
          initNode.callee.property.type === 'Identifier'
        )
          return initNode.callee.property.name;
      }
      if (initNode.type === 'MemberExpression') return getHookName(initNode.object);
      if (initNode.type === 'AwaitExpression') return getHookName(initNode.argument);
      return null;
    }

    function getHookGroup(hookName: string) {
      if (/^(useLocation|useTranslation|useRouter|useNavigate)$/.test(hookName))
        return { group: 1, name: hookName };
      if (/Context$/.test(hookName)) return { group: 2, name: hookName };
      if (/^(useState|useReducer|watch)$/.test(hookName)) return { group: 3, name: hookName };
      if (/(Query|Mutation)$/.test(hookName) || hookName === 'useMutation')
        return { group: 4, name: hookName };
      if (/^(useMemo|useCallback|useEffect|useLayoutEffect|useImperativeHandle)$/.test(hookName))
        return { group: 6, name: hookName };
      if (hookName.startsWith('use')) return { group: 5, name: hookName };
      // Normal function call
      return null;
    }

    function isReactComponent(node: any): boolean {
      if (
        node.type !== 'FunctionDeclaration' &&
        node.type !== 'ArrowFunctionExpression' &&
        node.type !== 'FunctionExpression'
      ) {
        return false;
      }

      let returnsJSX = false;
      if (node.body && node.body.type === 'BlockStatement') {
        const returnStmts = node.body.body.filter((stmt: any) => stmt.type === 'ReturnStatement');
        for (const stmt of returnStmts) {
          if (stmt.argument) {
            if (stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment') {
              returnsJSX = true;
              break;
            }
            if (
              stmt.argument.type === 'ParenthesizedExpression' &&
              (stmt.argument.expression.type === 'JSXElement' ||
                stmt.argument.expression.type === 'JSXFragment')
            ) {
              returnsJSX = true;
              break;
            }
          }
        }
      } else if (
        node.body &&
        (node.body.type === 'JSXElement' ||
          node.body.type === 'JSXFragment' ||
          (node.body.type === 'ParenthesizedExpression' &&
            (node.body.expression.type === 'JSXElement' ||
              node.body.expression.type === 'JSXFragment')))
      ) {
        returnsJSX = true;
      }

      let name = '';
      if (node.type === 'FunctionDeclaration' && node.id) name = node.id.name;
      else if (
        node.parent &&
        node.parent.type === 'VariableDeclarator' &&
        node.parent.id &&
        node.parent.id.type === 'Identifier'
      )
        name = node.parent.id.name;

      return returnsJSX && name !== '' && /^[A-Z]/.test(name);
    }

    function categorizeStatement(stmt: any, componentNode: any) {
      if (stmt.type === 'ReturnStatement') return { group: 11, name: 'JSX Return' };

      if (stmt.type === 'IfStatement') {
        const bodyContent =
          stmt.consequent.type === 'BlockStatement' ? stmt.consequent.body : [stmt.consequent];
        const containsReturn = bodyContent.some((s: any) => s.type === 'ReturnStatement');
        if (containsReturn) return { group: 10, name: 'Early Return' };
        return { group: -1, name: 'If Statement' };
      }

      if (stmt.type === 'ExpressionStatement') {
        const hookName = getHookName(stmt.expression);
        if (hookName) {
          const hookGroup = getHookGroup(hookName);
          if (hookGroup) return hookGroup;
        }
        return { group: -1, name: 'Dependency/Side-Effect' };
      }

      if (stmt.type === 'FunctionDeclaration') {
        const funcName = stmt.id ? stmt.id.name : '';
        if (funcName.startsWith('handle') || funcName.startsWith('on'))
          return { group: 8, name: `Handler (${funcName})` };
        return { group: 7, name: `Utility (${funcName})` };
      }

      if (stmt.type === 'VariableDeclaration') {
        const firstDeclarator = stmt.declarations[0];
        if (!firstDeclarator) return { group: -1, name: 'Empty Variable' };

        // Props Destructuring check
        if (
          firstDeclarator.id.type === 'ObjectPattern' &&
          firstDeclarator.init &&
          firstDeclarator.init.type === 'Identifier' &&
          firstDeclarator.init.name === 'props'
        ) {
          return { group: 0, name: 'Props Destructuring' };
        }

        const hookName = getHookName(firstDeclarator.init);
        if (hookName) {
          const hookResult = getHookGroup(hookName);
          if (hookResult) return hookResult;
        }

        const isFunc =
          firstDeclarator.init &&
          (firstDeclarator.init.type === 'ArrowFunctionExpression' ||
            firstDeclarator.init.type === 'FunctionExpression');
        if (isFunc) {
          const funcName = firstDeclarator.id.type === 'Identifier' ? firstDeclarator.id.name : '';
          if (funcName.startsWith('handle') || funcName.startsWith('on'))
            return { group: 8, name: `Handler (${funcName})` };
          return { group: 7, name: `Utility (${funcName})` };
        }

        // View values vs Dependency values
        const declaredVars = sourceCode.getDeclaredVariables(stmt as any);
        const isUsedInJSX = declaredVars.some((v) =>
          v.references.some((r) => isInsideJSXOrReturn(r.identifier as any, componentNode))
        );

        if (isUsedInJSX) return { group: 9, name: 'View Value' };
        return { group: -1, name: 'Dependency Value' };
      }

      return { group: -1, name: 'Other Statement' };
    }

    const GROUP_NAMES: Record<number, string> = {
      0: 'Props Destructuring',
      1: 'Priority Hooks',
      2: 'Context Hooks',
      3: 'State Hooks',
      4: 'Query Hooks',
      5: 'Custom Hooks',
      6: 'Effect Hooks',
      7: 'Utility Functions',
      8: 'Event Handlers',
      9: 'View Values',
      10: 'Early Returns',
      11: 'JSX Return',
    };

    return {
      'ArrowFunctionExpression, FunctionDeclaration, FunctionExpression'(node: any) {
        if (!isReactComponent(node)) return;

        if (node.body.type !== 'BlockStatement') return;
        const statements = node.body.body;

        let maxGroup = -1;
        let maxGroupName = '';
        const seenGroups = new Set<number>();
        let previousGroup = -2;

        let maxGroupNode: any = null;

        for (const stmt of statements) {
          const { group, name } = categorizeStatement(stmt, node);

          if (group === -1) {
            // Treat dependency values as completely transparent.
            // They don't enforce order against anything.
            previousGroup = group;
            continue;
          }

          // Contiguous checks
          for (const requiredBitisikGrup of [3, 7, 8]) {
            if (
              group === requiredBitisikGrup &&
              seenGroups.has(requiredBitisikGrup) &&
              previousGroup !== requiredBitisikGrup
            ) {
              context.report({
                node: stmt as any,
                messageId: 'contiguous',
                data: { current_name: GROUP_NAMES[requiredBitisikGrup] },
              });
            }
          }

          // Special Exception: View Values (Group 9) and Early Returns (Group 10) are functionally
          // interchangeable as far as layout rules are concerned in strict React design.
          // They can flip positions freely.
          const isViewAndReturnInterchangeable =
            (group === 9 && maxGroup === 10) || (group === 10 && maxGroup === 9);

          if (group < maxGroup && group !== -1 && !isViewAndReturnInterchangeable) {
            context.report({
              node: stmt as any,
              messageId: 'order',
              data: {
                current_name: name,
                current_group: GROUP_NAMES[group],
                prev_name: maxGroupName,
                prev_group: GROUP_NAMES[maxGroup],
              },
              fix(fixer) {
                if (!maxGroupNode) return null; // Safety fallback
                // Auto-fix layout: Swap positions using raw text
                const stmtText = sourceCode.getText(stmt as any);
                return [
                  fixer.remove(stmt as any),
                  fixer.insertTextBefore(maxGroupNode, stmtText + '\n'),
                ];
              },
            });
          } else {
            if (group > maxGroup) {
              maxGroup = group;
              maxGroupName = name;
              maxGroupNode = stmt;
            }
          }

          seenGroups.add(group);
          previousGroup = group;
        }
      },
    };
  },
};

export default reactComponentLayoutRule;
