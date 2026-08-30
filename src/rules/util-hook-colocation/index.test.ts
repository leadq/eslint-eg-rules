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

ruleTester.run('util-hook-colocation', rule, {
  valid: [
    // 1. Component importing from its own local utils
    {
      code: `import { formatAccountNumber } from './utils/formatAccountNumber';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 2. Component importing from its own local hooks
    {
      code: `import { useAccountDetail } from './hooks/useAccountDetail';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 3. Nested child component importing from parent component's utils
    {
      code: `import { formatAccountNumber } from '../utils/formatAccountNumber';`,
      filename: '/src/components/AccountDetail/TransactionList/index.tsx',
    },
    // 4. Deeply nested child component importing from ancestor component's hooks
    {
      code: `import { useAccountDetail } from '../../hooks/useAccountDetail';`,
      filename: '/src/components/AccountDetail/TransactionList/Item/index.tsx',
    },
    // 5. Component importing from global src/utils
    {
      code: `import { formatDate } from '@/utils/date/formatDate';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 6. Component importing from global relative src/utils
    {
      code: `import { formatDate } from '../../utils/date/formatDate';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 7. Component importing from global src/hooks
    {
      code: `import { useDebounce } from '@/hooks/useDebounce';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 8. Non-util/hook import across components (regular component imports are allowed)
    {
      code: `import { Header } from '../Header';`,
      filename: '/src/components/AccountDetail/index.tsx',
    },
    // 9. Page importing from its own local utils
    {
      code: `import { calculateSummary } from './utils/calculateSummary';`,
      filename: '/src/pages/Dashboard/index.tsx',
    },
  ],
  invalid: [
    // 1. Sibling component importing from another component's utils
    {
      code: `import { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';`,
      filename: '/src/components/TransactionList/index.tsx',
      errors: [
        {
          messageId: 'colocationViolation',
          data: {
            folderType: 'utils',
            importedPath: '../AccountDetail/utils/formatAccountNumber',
            componentName: 'AccountDetail',
            importerPath: '/src/components/TransactionList/index.tsx',
          },
        },
      ],
    },
    // 2. Sibling component importing from another component's hooks
    {
      code: `import { useAccountDetail } from '../AccountDetail/hooks/useAccountDetail';`,
      filename: '/src/components/TransactionList/index.tsx',
      errors: [
        {
          messageId: 'colocationViolation',
          data: {
            folderType: 'hooks',
            importedPath: '../AccountDetail/hooks/useAccountDetail',
            componentName: 'AccountDetail',
            importerPath: '/src/components/TransactionList/index.tsx',
          },
        },
      ],
    },
    // 3. Page importing from a component's local utils
    {
      code: `import { formatAccountNumber } from '../../components/AccountDetail/utils/formatAccountNumber';`,
      filename: '/src/pages/Dashboard/index.tsx',
      errors: [
        {
          messageId: 'colocationViolation',
          data: {
            folderType: 'utils',
            importedPath: '../../components/AccountDetail/utils/formatAccountNumber',
            componentName: 'AccountDetail',
            importerPath: '/src/pages/Dashboard/index.tsx',
          },
        },
      ],
    },
    // 4. Re-exporting from another component's local utils
    {
      code: `export { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';`,
      filename: '/src/components/TransactionList/index.tsx',
      errors: [
        {
          messageId: 'colocationViolation',
          data: {
            folderType: 'utils',
            importedPath: '../AccountDetail/utils/formatAccountNumber',
            componentName: 'AccountDetail',
            importerPath: '/src/components/TransactionList/index.tsx',
          },
        },
      ],
    },
  ],
});
