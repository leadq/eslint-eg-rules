import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { EVENT_PAST_TENSE_MAP } from '../../utils/react-events';

type Options = [{ allowPastTense?: boolean; blacklist?: string[]; whitelist?: string[] }];
type MessageIds = 'invalidCallbackProp' | 'pastTenseEvent' | 'blacklistedEvent';

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{ allowPastTense: false }],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Callback props in React Component types must have an "on" prefix.',
    },
    messages: {
      invalidCallbackProp: "Callback prop '{{name}}' must start with 'on' prefix (e.g., onClick).",
      pastTenseEvent:
        "Callback prop '{{name}}' must not use past tense ending. Use '{{event}}' instead of '{{pastTense}}'.",
      blacklistedEvent: "Callback prop '{{name}}' ends with a blacklisted suffix '{{suffix}}'.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowPastTense: {
            type: 'boolean',
          },
          blacklist: {
            type: 'array',
            items: { type: 'string' },
          },
          whitelist: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const allowPastTense = options.allowPastTense === true;
    const blacklist = options.blacklist || [];
    const whitelist = options.whitelist || [];

    const componentPropTypes = new Set<string>();
    const interfaceMap = new Map<
      string,
      TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration
    >();

    function addPropTypeFromParam(param: TSESTree.Node | undefined) {
      if (!param) return;
      if ('typeAnnotation' in param && param.typeAnnotation) {
        const typeAnn = param.typeAnnotation;
        if (
          typeAnn.type === 'TSTypeAnnotation' &&
          typeAnn.typeAnnotation.type === 'TSTypeReference' &&
          typeAnn.typeAnnotation.typeName.type === 'Identifier'
        ) {
          componentPropTypes.add(typeAnn.typeAnnotation.typeName.name);
        }
      }
    }

    return {
      TSInterfaceDeclaration(node) {
        interfaceMap.set(node.id.name, node);
      },
      TSTypeAliasDeclaration(node) {
        interfaceMap.set(node.id.name, node);
      },
      FunctionDeclaration(node) {
        if (node.id && /^[A-Z]/.test(node.id.name)) {
          addPropTypeFromParam(node.params[0]);
        }
      },
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier' && /^[A-Z]/.test(node.id.name)) {
          // Check React.FC<Props> or FC<Props>
          if (
            node.id.typeAnnotation &&
            node.id.typeAnnotation.type === 'TSTypeAnnotation' &&
            node.id.typeAnnotation.typeAnnotation.type === 'TSTypeReference'
          ) {
            const typeRef = node.id.typeAnnotation.typeAnnotation;
            const isFC =
              (typeRef.typeName.type === 'Identifier' && typeRef.typeName.name === 'FC') ||
              (typeRef.typeName.type === 'TSQualifiedName' &&
                typeRef.typeName.left.type === 'Identifier' &&
                typeRef.typeName.left.name === 'React' &&
                typeRef.typeName.right.type === 'Identifier' &&
                typeRef.typeName.right.name === 'FC');

            if (isFC && typeRef.typeArguments && typeRef.typeArguments.params.length > 0) {
              const firstArg = typeRef.typeArguments.params[0];
              if (firstArg.type === 'TSTypeReference' && firstArg.typeName.type === 'Identifier') {
                componentPropTypes.add(firstArg.typeName.name);
              }
            }
          }

          // Check Component = (props: Props) => {}
          if (
            node.init &&
            (node.init.type === 'ArrowFunctionExpression' ||
              node.init.type === 'FunctionExpression')
          ) {
            addPropTypeFromParam(node.init.params[0]);
          }
        }
      },
      'Program:exit'() {
        componentPropTypes.forEach((typeName) => {
          const node = interfaceMap.get(typeName);
          if (!node) return;

          let members: TSESTree.TypeElement[] = [];

          if (node.type === 'TSInterfaceDeclaration') {
            members = node.body.body;
          } else if (
            node.type === 'TSTypeAliasDeclaration' &&
            node.typeAnnotation.type === 'TSTypeLiteral'
          ) {
            members = node.typeAnnotation.members;
          }

          members.forEach((member) => {
            let isFunction = false;
            let memberName = '';
            let memberNode: TSESTree.Node = member;

            if (member.type === 'TSMethodSignature' && member.key.type === 'Identifier') {
              isFunction = true;
              memberName = member.key.name;
              memberNode = member.key;
            } else if (
              member.type === 'TSPropertySignature' &&
              member.key.type === 'Identifier' &&
              member.typeAnnotation?.typeAnnotation?.type === 'TSFunctionType'
            ) {
              isFunction = true;
              memberName = member.key.name;
              memberNode = member.key;
            }

            if (isFunction && memberName) {
              if (!memberName.startsWith('on')) {
                context.report({
                  node: memberNode,
                  messageId: 'invalidCallbackProp',
                  data: {
                    name: memberName,
                  },
                });
              } else {
                const isWhitelisted = whitelist.some((suffix) => memberName.endsWith(suffix));
                if (isWhitelisted) {
                  return; // It's strictly allowed, skip other checks
                }

                const blacklistedSuffix = blacklist.find((suffix) => memberName.endsWith(suffix));
                if (blacklistedSuffix) {
                  context.report({
                    node: memberNode,
                    messageId: 'blacklistedEvent',
                    data: {
                      name: memberName,
                      suffix: blacklistedSuffix,
                    },
                  });
                  return; // Don't check for past tense if it's already blacklisted
                }

                if (!allowPastTense) {
                  for (const [baseEvent, pastTenses] of Object.entries(EVENT_PAST_TENSE_MAP)) {
                    const foundPastTense = pastTenses.find((pt) => memberName.endsWith(pt));
                    if (foundPastTense) {
                      context.report({
                        node: memberNode,
                        messageId: 'pastTenseEvent',
                        data: {
                          name: memberName,
                          event: baseEvent,
                          pastTense: foundPastTense,
                        },
                      });
                      break;
                    }
                  }
                }
              }
            }
          });
        });
      },
    };
  },
};

export default rule;
