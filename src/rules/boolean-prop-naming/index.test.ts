import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from './index';
import * as path from 'path';

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

ruleTester.run('boolean-prop-naming', rule, {
  valid: [
    // Interfaces in components
    {
      code: `
        interface ButtonProps {
          isActive: boolean;
          hasIcon?: boolean;
          canSubmit: boolean | undefined;
        }
      `,
      filename: '/src/components/Button.tsx',
    },
    // Parameter types in hooks
    {
      code: `
        function useToggle(isReady: boolean = false) {}
      `,
      filename: '/src/hooks/useToggle.ts',
    },
    // Object types in utils
    {
      code: `
        type Options = {
          shouldFetch: boolean;
          didMount: boolean | null;
        }
      `,
      filename: '/src/utils/types.ts',
    },
    // Ignore non-boolean props even if un-prefixed
    {
      code: `
        interface ButtonProps {
          name: string;
          active: string;
          ready: any;
        }
      `,
      filename: '/src/components/Button.tsx',
    },
    // Ignore non-target folders (like apis)
    {
      code: `
        interface ApiRequest {
          active: boolean;
        }
        function send(ready: boolean) {}
      `,
      filename: '/src/apis/request.ts',
    },
    // Custom option prefix
    {
      code: `
        interface DemoProps {
          enableCache: boolean;
        }
      `,
      filename: '/src/components/Demo.tsx',
      options: [{ prefixes: ['enable'] }],
    },
  ],
  invalid: [
    {
      code: `
        interface ButtonProps {
          active: boolean; // prefix missing
        }
      `,
      filename: '/src/components/Button.tsx',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        interface ButtonProps {
          loading?: boolean; // prefix missing on optional prop
        }
      `,
      filename: '/src/components/Button.tsx',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        type Options = {
          fetch: boolean | null; // Prefix missing with union
        }
      `,
      filename: '/src/utils/index.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        function useToggle(ready: boolean) {}
      `,
      filename: '/src/hooks/useToggle.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        const useReady = (ready: boolean = false) => {}
      `,
      filename: '/src/hooks/useReady.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        class UtilClass {
          active: boolean = false;
        }
      `,
      filename: '/src/utils/class.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        class UtilClass {
          active = true; // implicit boolean via literal
        }
      `,
      filename: '/src/utils/class.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
    {
      code: `
        type Options = {
          enableCache: boolean;
        }
      `,
      options: [{ prefixes: ['is', 'has'] }], // 'enable' is not the list
      filename: '/src/components/Opt.ts',
      errors: [{ messageId: 'missingPrefix' }],
    },
  ],
});
