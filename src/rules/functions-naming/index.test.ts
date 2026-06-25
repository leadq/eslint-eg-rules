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

ruleTester.run('functions-naming', rule, {
  valid: [
    // JSX Valid Cases
    `function renderButtons() { return <button/>; }`,
    `const renderTitle = () => <h1>Title</h1>;`,
    `const renderText = function() { return <span>Text</span>; }`,
    // Components (capitalized name) should ignore the render rule
    `function MyComponent() { return <div />; }`,
    `const MyArrowComponent = () => <div />;`,

    // Boolean Valid Cases
    `function isReady() { return true; }`,
    `const hasError = () => false;`,
    `const willSucceed = function() { return true; }`,
    `function canExecute(): boolean { return x; }`,

    // Object/Array/Primitive Valid Cases (Value prefix)
    `function calculateSum() { return 1 + 1; }`,
    `const getNames = () => ['a', 'b'];`,
    `const determineState = function() { return { state: 1 }; }`,
    `function getConfig(): object { return {}; }`,
    `const getAge = () => 20;`,

    // Hooks should be ignored
    `function useForm() { return [value, setValue]; }`,
    `const useStore = () => ({});`,

    // Event handlers can be considered edge cases to ignore
    `function onClick() { return true; }`,
    `const handleFetch = () => ({});`,

    // Void or Undefined returns should be ignored
    `function doSomething() { console.log('hi'); }`,
    `const doNothing = () => void 0;`,
    `function setAge() { this.age = 20; }`,
  ],
  invalid: [
    {
      code: `function someFunction() { return <div />; }`,
      errors: [{ messageId: 'missingRenderPrefix' }],
    },
    {
      code: `const myValue = () => <span />;`,
      errors: [{ messageId: 'missingRenderPrefix' }],
    },
    {
      code: `function checkReady() { return true; }`,
      errors: [{ messageId: 'missingBooleanPrefix' }],
    },
    {
      code: `const validFlag = () => false;`,
      errors: [{ messageId: 'missingBooleanPrefix' }],
    },
    {
      code: `function fetchConfig() { return { a: 1 }; }`,
      errors: [{ messageId: 'missingValuePrefix' }],
    },
    {
      code: `const nameList = () => ['Alice', 'Bob'];`,
      errors: [{ messageId: 'missingValuePrefix' }],
    },
  ],
});
