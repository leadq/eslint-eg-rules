import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import * as path from 'path';
import rule from './index';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

ruleTester.run('api-type-suffix', rule as any, {
  valid: [
    // Standard correct usage
    {
      code: `interface UserModel {}`,
      filename: '/src/apis/user.ts',
    },
    {
      code: `type UserResponse = {};`,
      filename: '/src/apis/user.ts',
    },
    {
      code: `interface RequestHelperModel {}`,
      filename: '/src/apis/helper.ts',
    },
    // outside of /src/apis/, anything is allowed
    {
      code: `interface UserRequestModel {}`, // invalid suffix but outside apis
      filename: '/src/components/User.ts',
    },
    {
      code: `type RandomName = {};`,
      filename: '/src/utils/types.ts',
    },
    // Custom options
    {
      code: `interface UserDTO {}`,
      options: [{ suffixes: ['DTO'] }],
      filename: '/src/apis/user.ts',
    },
    {
      code: `interface UserModel {}`,
      options: [{ suffixes: ['Model', 'Data'] }],
      filename: '/src/apis/user.ts',
    },
  ],
  invalid: [
    // Consecutive Default Suffixes
    {
      code: `interface UserRequestModel {}`,
      filename: '/src/apis/user.ts',
      errors: [
        {
          messageId: 'consecutiveSuffix',
          data: { name: 'UserRequestModel', consecutive: 'Request', matched: 'Model' },
        },
      ],
    },
    // Invalid default suffix
    {
      code: `interface UserModelDto {}`,
      filename: '/src/apis/user.ts',
      errors: [
        {
          messageId: 'invalidSuffix',
          data: { name: 'UserModelDto', suffixes: 'Model, Response, Request' },
        },
      ],
    },
    // Custom options invalid suffix
    {
      code: `interface UserModel {}`,
      options: [{ suffixes: ['DTO', 'Entity'] }],
      filename: '/src/apis/user.ts',
      errors: [
        {
          messageId: 'invalidSuffix',
          data: { name: 'UserModel', suffixes: 'DTO, Entity' },
        },
      ],
    },
    // Custom options consecutive suffixes
    {
      code: `interface UserEntityDTO {}`,
      options: [{ suffixes: ['DTO', 'Entity'] }],
      filename: '/src/apis/user.ts',
      errors: [
        {
          messageId: 'consecutiveSuffix',
          data: { name: 'UserEntityDTO', consecutive: 'Entity', matched: 'DTO' },
        },
      ],
    },
  ],
});
