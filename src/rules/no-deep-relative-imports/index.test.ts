import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
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

ruleTester.run('no-deep-relative-imports', rule, {
  valid: [
    // 1. Same directory import
    {
      code: `import { Button } from './Button';`,
    },
    // 2. 1 level up import
    {
      code: `import { helper } from '../helper';`,
    },
    // 3. 2 levels up import (within default maxDepth of 2)
    {
      code: `import { format } from '../../utils/format';`,
    },
    // 4. Path alias import (Recommended)
    {
      code: `import { formatDate } from '@/utils/formatDate';`,
    },
    // 5. Scoped category alias import
    {
      code: `import { formatDate } from '@utils/formatDate';`,
    },
    // 6. External package import
    {
      code: `import React from 'react';`,
    },
    // 7. Custom maxDepth = 3
    {
      code: `import { data } from '../../../data';`,
      options: [{ maxDepth: 3 }],
    },
    // 8. Normalized shallow path: ./../foo (depth 1, within maxDepth 2)
    {
      code: `import { foo } from './../foo';`,
    },
  ],
  invalid: [
    // 1. 3 levels up import with default maxDepth 2
    {
      code: `import { formatDate } from '../../../utils/formatDate';`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../utils/formatDate',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 2. 4 levels up import
    {
      code: `import { useUser } from '../../../../hooks/useUser';`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../../hooks/useUser',
            actualDepth: 4,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 3. Re-export with deep relative path
    {
      code: `export { Header } from '../../../components/Header';`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../components/Header',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 4. Dynamic import with deep relative path
    {
      code: `const load = () => import('../../../lazy/Module');`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../lazy/Module',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 5. Dynamic import with template literal
    {
      code: 'const load = () => import(`../../../lazy/Module`);',
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../lazy/Module',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 6. CommonJS require with deep relative path
    {
      code: `const mod = require('../../../utils/helper');`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../utils/helper',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 7. TypeScript import equals with deep relative path
    {
      code: `import helper = require('../../../utils/helper');`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../../utils/helper',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
    // 8. Custom maxDepth = 1 and custom suggestedAlias
    {
      code: `import { util } from '../../utils';`,
      options: [{ maxDepth: 1, suggestedAlias: 'src/' }],
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '../../utils',
            actualDepth: 2,
            maxDepth: 1,
            suggestedAlias: 'src/',
          },
        },
      ],
    },
    // 9. Messy path normalized: .././../../utils (depth 3)
    {
      code: `import { util } from '.././../../utils';`,
      errors: [
        {
          messageId: 'deepRelativeImport',
          data: {
            importPath: '.././../../utils',
            actualDepth: 3,
            maxDepth: 2,
            suggestedAlias: '@/',
          },
        },
      ],
    },
  ],
});
