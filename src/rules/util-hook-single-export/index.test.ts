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

ruleTester.run('util-hook-single-export', rule, {
  valid: [
    // 1. Single named function export with const arrow function
    {
      code: `
        export const formatDate = (date: Date): string => {
          return date.toISOString();
        };
      `,
      filename: '/src/utils/date/formatDate.ts',
    },
    // 2. Single named function declaration
    {
      code: `
        export function formatDate(date: Date): string {
          return date.toISOString();
        }
      `,
      filename: '/src/utils/date/formatDate.ts',
    },
    // 3. Single hook export
    {
      code: `
        export const useDebounce = <T>(value: T, delay: number): T => {
          return value;
        };
      `,
      filename: '/src/hooks/useDebounce.ts',
    },
    // 4. Single hook function declaration
    {
      code: `
        export function useAccountDetail() {
          return {};
        }
      `,
      filename: '/src/components/AccountDetail/hooks/useAccountDetail.ts',
    },
    // 5. Single export with unexported (private) helper functions
    {
      code: `
        const getData = () => { return {}; };
        const formatData = (data: any) => { return data; };

        export const calculateBalance = () => {
          const current = getData();
          return formatData(current);
        };
      `,
      filename: '/src/utils/calculateBalance.ts',
    },
    // 6. Single function with exported TypeScript type/interface (allowTypeExports: true default)
    {
      code: `
        export interface FormatDateOptions {
          locale?: string;
        }

        export type DateInput = Date | string | number;

        export const formatDate = (date: DateInput, options?: FormatDateOptions): string => {
          return '';
        };
      `,
      filename: '/src/utils/date/formatDate.ts',
    },
    // 7. Single export with export specifier list (export { formatDate })
    {
      code: `
        const formatDate = (date: Date) => '';
        export { formatDate };
      `,
      filename: '/src/utils/date/formatDate.ts',
    },
    // 8. Single export in component local utils
    {
      code: `
        export const formatAccountNumber = (account: string) => account;
      `,
      filename: '/src/components/AccountDetail/utils/formatAccountNumber.ts',
    },
    // 9. Ignored file: index.ts barrel file
    {
      code: `
        export const a = () => {};
        export const b = () => {};
      `,
      filename: '/src/utils/date/index.ts',
    },
    // 10. Ignored file: unit test file
    {
      code: `
        export const testHelperA = () => {};
        export const testHelperB = () => {};
      `,
      filename: '/src/utils/date/__tests__/formatDate.test.ts',
    },
    // 11. Ignored file outside utils/hooks
    {
      code: `
        export const a = 1;
        export const b = 2;
        export const c = 3;
      `,
      filename: '/src/constants/common.ts',
    },
    // 12. Allowed default export when configured
    {
      code: `
        const useDebounce = () => {};
        export default useDebounce;
      `,
      options: [{ allowDefaultExport: true, enforceFileNameMatch: false }],
      filename: '/src/hooks/useDebounce.ts',
    },
    // 13. Allowed multiple exports when maxExports is customized
    {
      code: `
        export const isString = (v: any) => typeof v === 'string';
        export const isNumber = (v: any) => typeof v === 'number';
      `,
      options: [{ maxExports: 2, enforceFileNameMatch: false }],
      filename: '/src/utils/common/typeGuards.ts',
    },
  ],
  invalid: [
    // 1. Multiple exported functions in a single util file
    {
      code: `
        export const formatDate = (date: Date) => {};
        export const getDayDiff = (a: Date, b: Date) => {};
        export const isWeekend = (date: Date) => {};
      `,
      filename: '/src/utils/date/formatDate.ts',
      errors: [
        {
          messageId: 'multipleExports',
          data: {
            maxExports: '1',
            count: '3',
            names: 'formatDate, getDayDiff, isWeekend',
          },
        },
      ],
    },
    // 2. Multiple function declarations in single hook file
    {
      code: `
        export function useFirstHook() {}
        export function useSecondHook() {}
      `,
      filename: '/src/hooks/useFirstHook.ts',
      errors: [
        {
          messageId: 'multipleExports',
          data: {
            maxExports: '1',
            count: '2',
            names: 'useFirstHook, useSecondHook',
          },
        },
      ],
    },
    // 3. Multiple exports via variable declaration list
    {
      code: `
        export const foo = () => {}, bar = () => {};
      `,
      filename: '/src/utils/foo.ts',
      errors: [
        {
          messageId: 'multipleExports',
          data: {
            maxExports: '1',
            count: '2',
            names: 'foo, bar',
          },
        },
      ],
    },
    // 4. Multiple exports via export specifier statement
    {
      code: `
        const a = () => {};
        const b = () => {};
        export { a, b };
      `,
      filename: '/src/utils/a.ts',
      errors: [
        {
          messageId: 'multipleExports',
          data: {
            maxExports: '1',
            count: '2',
            names: 'a, b',
          },
        },
      ],
    },
    // 5. Default export forbidden by default
    {
      code: `
        export default function calculateBalance() {}
      `,
      filename: '/src/utils/calculateBalance.ts',
      errors: [
        {
          messageId: 'noDefaultExport',
        },
      ],
    },
    // 6. Default export via expression forbidden by default
    {
      code: `
        const useModal = () => {};
        export default useModal;
      `,
      filename: '/src/hooks/useModal.ts',
      errors: [
        {
          messageId: 'noDefaultExport',
        },
      ],
    },
    // 7. Banned collector file name (dateUtils.ts)
    {
      code: `
        export const formatDate = (date: Date) => {};
      `,
      filename: '/src/utils/dateUtils.ts',
      errors: [
        {
          messageId: 'bannedFileName',
          data: {
            fileName: 'dateUtils.ts',
            suggestedFolder: 'date',
          },
        },
      ],
    },
    // 8. Banned collector file name (helpers.ts)
    {
      code: `
        export const helper = () => {};
      `,
      filename: '/src/utils/helpers.ts',
      errors: [
        {
          messageId: 'bannedFileName',
          data: {
            fileName: 'helpers.ts',
            suggestedFolder: 'common',
          },
        },
      ],
    },
    // 9. Exported function name does not match file name
    {
      code: `
        export const getFormattedDate = (date: Date) => {};
      `,
      filename: '/src/utils/date/formatDate.ts',
      errors: [
        {
          messageId: 'fileNameMismatch',
          data: {
            exportName: 'getFormattedDate',
            expectedName: 'formatDate',
          },
        },
      ],
    },
    // 10. Type exports disallowed when allowTypeExports is false
    {
      code: `
        export type DateFormat = string;
        export const formatDate = () => {};
      `,
      options: [{ allowTypeExports: false }],
      filename: '/src/utils/date/formatDate.ts',
      errors: [
        {
          messageId: 'multipleExports',
          data: {
            maxExports: '1',
            count: '2',
            names: 'DateFormat, formatDate',
          },
        },
      ],
    },
  ],
});
