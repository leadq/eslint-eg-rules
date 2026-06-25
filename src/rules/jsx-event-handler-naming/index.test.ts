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
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('jsx-event-handler-naming', rule, {
  valid: [
    // Ignore params/props
    {
      code: `
        function Component({ onClick }) {
          return <div onClick={onClick} />;
        }
      `,
    },
    // Ignore imported functions
    {
      code: `
        import { importedHandler } from './utils';
        function Component() {
          return <div onClick={importedHandler} />;
        }
      `,
    },
    // Ignore global functions
    {
      code: `
        function globalHandler() {}
        function Component() {
          return <div onClick={globalHandler} />;
        }
      `,
    },
    // Valid standard case
    {
      code: `
        function Component() {
          const handleClick = () => {};
          return <div onClick={handleClick} />;
        }
      `,
    },
    // Valid strict false (handler doesn't exactly end with the same event string)
    {
      code: `
        function Component() {
          const handleListUpdate = () => {};
          return <input onChange={handleListUpdate} />;
        }
      `,
      options: [{ strict: false }],
    },
    // Valid strict true (handler ends with the event from the prop)
    {
      code: `
        function Component() {
          const handleListChange = () => {};
          return <input onChange={handleListChange} />;
        }
      `,
      options: [{ strict: true }],
    },
    // Also valid for strict default configuration
    {
      code: `
        function Component() {
          const handleListChange = () => {};
          return <input onChange={handleListChange} />;
        }
      `,
    },
    // Not an event prop
    {
      code: `
        function Component() {
          const somethingElse = () => {};
          return <div customProp={somethingElse} />;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function Component() {
          const updateData = () => {};
          return <div onClick={updateData} />;
        }
      `,
      errors: [{ messageId: 'missingHandlePrefix' }],
    },
    {
      code: `
        function Component() {
          const myClick = () => {};
          return <div onClick={myClick} />;
        }
      `,
      errors: [{ messageId: 'missingHandlePrefix' }],
      options: [{ strict: false }],
    },
    {
      code: `
        function Component() {
          const handleChange = () => {};
          return <input onListChange={handleChange} />;
        }
      `,
      errors: [{ messageId: 'strictMismatch' }],
      options: [{ strict: true }],
    },
    {
      code: `
        function Component() {
          function myFn() {}
          return <div onChange={myFn} />;
        }
      `,
      errors: [{ messageId: 'missingHandlePrefix' }],
      options: [{ strict: false }],
    },
  ],
});
