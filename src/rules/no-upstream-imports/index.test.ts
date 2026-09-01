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

ruleTester.run('no-upstream-imports', rule, {
  valid: [
    // 1. Component importing from shared utils (Downstream dependency is permitted)
    {
      code: `import { formatDate } from '@/utils/formatDate';`,
      filename: '/src/components/UserCard/index.tsx',
    },
    // 2. Page importing from shared hooks
    {
      code: `import { useDebounce } from '@/hooks/useDebounce';`,
      filename: '/src/pages/Dashboard/index.tsx',
    },
    // 3. Shared util importing from another shared util (Same layer dependency is permitted)
    {
      code: `import { padZero } from './padZero';`,
      filename: '/src/utils/formatDate.ts',
    },
    // 4. Shared hook importing from shared util (Shared-to-shared is permitted)
    {
      code: `import { formatDate } from '@/utils/formatDate';`,
      filename: '/src/hooks/useUser.ts',
    },
    // 5. Shared service importing from types
    {
      code: `import { UserModel } from '@/types/user';`,
      filename: '/src/services/userService.ts',
    },
    // 6. Type-only import allowed when option allowTypeImports is true
    {
      code: `import type { UserCardProps } from '@/components/UserCard';`,
      filename: '/src/utils/formatUser.ts',
      options: [{ allowTypeImports: true }],
    },
    // 7. Inline specifier type-only import allowed when option allowTypeImports is true
    {
      code: `import { type UserCardProps } from '@/components/UserCard';`,
      filename: '/src/utils/formatUser.ts',
      options: [{ allowTypeImports: true }],
    },
  ],
  invalid: [
    // 1. Shared util importing from a UI component via alias
    {
      code: `import { UserCard } from '@/components/UserCard';`,
      filename: '/src/utils/formatUser.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'utils',
            importedLayer: 'components',
            importedPath: '@/components/UserCard',
          },
        },
      ],
    },
    // 2. Shared util importing from a UI component via relative path
    {
      code: `import { UserCard } from '../components/UserCard';`,
      filename: '/src/utils/formatUser.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'utils',
            importedLayer: 'components',
            importedPath: '../components/UserCard',
          },
        },
      ],
    },
    // 3. Shared hook importing from a page via @pages alias
    {
      code: `import { Dashboard } from '@pages/Dashboard';`,
      filename: '/src/hooks/useAnalytics.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'hooks',
            importedLayer: 'pages',
            importedPath: '@pages/Dashboard',
          },
        },
      ],
    },
    // 4. Shared type file re-exporting from a component
    {
      code: `export { ButtonProps } from '@/components/Button';`,
      filename: '/src/types/index.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'types',
            importedLayer: 'components',
            importedPath: '@/components/Button',
          },
        },
      ],
    },
    // 5. Shared service dynamic import of a component
    {
      code: `const loadModal = () => import('@/components/Modal');`,
      filename: '/src/services/modalService.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'services',
            importedLayer: 'components',
            importedPath: '@/components/Modal',
          },
        },
      ],
    },
    // 6. Dynamic import via template literal
    {
      code: 'const loadModal = () => import(`@components/Modal`);',
      filename: '/src/services/modalService.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'services',
            importedLayer: 'components',
            importedPath: '@components/Modal',
          },
        },
      ],
    },
    // 7. CommonJS require in shared layer
    {
      code: `const { UserCard } = require('@components/UserCard');`,
      filename: '/src/utils/userHelper.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'utils',
            importedLayer: 'components',
            importedPath: '@components/UserCard',
          },
        },
      ],
    },
    // 8. TypeScript import equals in shared layer
    {
      code: `import UserCard = require('@components/UserCard');`,
      filename: '/src/utils/userHelper.ts',
      errors: [
        {
          messageId: 'upstreamImportViolation',
          data: {
            currentLayer: 'utils',
            importedLayer: 'components',
            importedPath: '@components/UserCard',
          },
        },
      ],
    },
  ],
});
