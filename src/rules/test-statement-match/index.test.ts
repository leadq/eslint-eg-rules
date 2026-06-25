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

const withFilename = (testCases: any[]) =>
  testCases.map((tc) => ({
    ...tc,
    filename: tc.filename || 'src/components/MyComponent.test.ts',
  }));

ruleTester.run('test-statement-match', rule as any, {
  valid: withFilename([
    {
      code: `it('should work properly', () => {})`,
    },
    {
      code: `it.only('should render correctly', () => {})`,
    },
    {
      code: 'it(`should handle template literals properly`, () => {})',
    },
    {
      code: `test('renders when open is true', () => {})`,
    },
    {
      code: `test.skip('closes if clicked outside', () => {})`,
    },
    {
      code: `test('fails while loading', () => {})`,
    },
    {
      code: `describe('some component', () => {})`,
    },
    {
      code: `someOtherFunc('random string', () => {})`,
    },
    {
      code: `it()`,
    },
    {
      code: `it(myVariable, () => {})`,
    },
    {
      code: `test('works assuming conditions are met', () => {})`,
      options: [{ conjunctions: ['assuming'] }],
    },
    // ignored file test
    {
      code: `it('works properly', () => {})`, // Missing "should " but ignored because file is not .test.
      filename: 'src/components/MyComponent.ts',
    },
    // ignored mock inside __tests__
    {
      code: `it('works properly', () => {})`, // Missing "should " but ignored because .mock.
      filename: 'src/__tests__/MyComponent.mock.ts',
    },
    // custom ignore pattern inside __tests__
    {
      code: `it('works properly', () => {})`, // Missing "should " but ignored by custom pattern
      filename: 'src/__tests__/utils/helpers.utils.ts',
      options: [{ ignoreTestPatterns: ['\\.utils\\.ts$'] }],
    },
  ]),
  invalid: withFilename([
    {
      code: `it('works properly', () => {})`,
      errors: [
        {
          messageId: 'itMustStartWithShould',
        },
      ],
    },
    {
      code: `it('works properly', () => {})`, // Missing "should " inside __tests__
      filename: 'src/__tests__/MyComponent.ts',
      errors: [
        {
          messageId: 'itMustStartWithShould',
        },
      ],
    },
    {
      code: `it.only('shouldNot space correctly', () => {})`,
      errors: [
        {
          messageId: 'itMustStartWithShould',
        },
      ],
    },
    {
      code: 'it(`does something correctly`, () => {})',
      errors: [
        {
          messageId: 'itMustStartWithShould',
        },
      ],
    },
    {
      code: `test('renders correctly', () => {})`,
      errors: [
        {
          messageId: 'testMustContainConjunction',
          data: { conjunctions: 'if, when, while' },
        },
      ],
    },
    {
      code: `test.skip('closes on click outside', () => {})`,
      errors: [
        {
          messageId: 'testMustContainConjunction',
          data: { conjunctions: 'if, when, while' },
        },
      ],
    },
    {
      code: `test('fails to load', () => {})`,
      errors: [
        {
          messageId: 'testMustContainConjunction',
          data: { conjunctions: 'if, when, while' },
        },
      ],
    },
    {
      code: `test('works assuming conditions are met', () => {})`,
      options: [{ conjunctions: ['given'] }],
      errors: [
        {
          messageId: 'testMustContainConjunction',
          data: { conjunctions: 'given' },
        },
      ],
    },
  ]),
});
