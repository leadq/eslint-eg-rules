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
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-test-attrs', rule, {
  valid: [
    // ✅ Normal JSX attributes are fine in component files
    {
      code: `const el = <div className="box" id="main" />;`,
      filename: '/src/components/Box.tsx',
    },
    // ✅ Custom aria attribute — not a test attr
    {
      code: `const el = <button aria-label="close" />;`,
      filename: '/src/components/Modal.tsx',
    },
    // ✅ data-testid IS allowed inside a test file
    {
      code: `const el = <div data-testid="submit-btn" />;`,
      filename: '/src/components/Button.test.tsx',
    },
    // ✅ data-cy IS allowed inside a spec file
    {
      code: `const el = <input data-cy="email-input" />;`,
      filename: '/src/components/Form.spec.tsx',
    },
    // ✅ data-testid IS allowed inside __tests__ folder
    {
      code: `const el = <div data-testid="card" />;`,
      filename: '/src/__tests__/Card.tsx',
    },
    // ✅ data-testid IS allowed with .test.tsx extension
    {
      code: `const el = <div data-testid="card" />;`,
      filename: '/src/components/Card.test.tsx',
    },
    // ✅ Custom attr list: only 'data-qa' is forbidden, so data-testid is fine
    {
      code: `const el = <div data-testid="box" />;`,
      filename: '/src/components/Box.tsx',
      options: [{ attrs: ['data-qa'] }],
    },
    // ✅ Forbidden attr used inside a .spec file even with custom list
    {
      code: `const el = <div data-qa="my-btn" />;`,
      filename: '/src/components/Button.spec.tsx',
      options: [{ attrs: ['data-qa'] }],
    },
  ],
  invalid: [
    // ❌ data-testid in a real component
    {
      code: `const el = <div data-testid="submit-btn" />;`,
      filename: '/src/components/Button.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-testid' } }],
    },
    // ❌ data-test in a real component
    {
      code: `const el = <input data-test="email" />;`,
      filename: '/src/components/Form.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-test' } }],
    },
    // ❌ data-cy in a real component
    {
      code: `const el = <button data-cy="login" />;`,
      filename: '/src/components/LoginButton.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-cy' } }],
    },
    // ❌ data-e2e in a real component
    {
      code: `const el = <section data-e2e="hero" />;`,
      filename: '/src/components/HeroSection.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-e2e' } }],
    },
    // ❌ data-test-id in a real component
    {
      code: `const el = <form data-test-id="register" />;`,
      filename: '/src/components/Register.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-test-id' } }],
    },
    // ❌ In a hooks file — not a test file, so forbidden
    {
      code: `const el = <div data-testid="hook-output" />;`,
      filename: '/src/hooks/useUser.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-testid' } }],
    },
    // ❌ Multiple forbidden attrs on same element — each gets its own error
    {
      code: `const el = <div data-testid="box" data-cy="box" />;`,
      filename: '/src/components/Box.tsx',
      errors: [
        { messageId: 'noTestAttr', data: { attr: 'data-testid' } },
        { messageId: 'noTestAttr', data: { attr: 'data-cy' } },
      ],
    },
    // ❌ Custom attr list in a non-test file
    {
      code: `const el = <div data-qa="my-btn" />;`,
      filename: '/src/components/Button.tsx',
      options: [{ attrs: ['data-qa'] }],
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-qa' } }],
    },
    // ❌ data-testid inside a page/route file — not a component but still non-test
    {
      code: `const el = <main data-testid="page-root" />;`,
      filename: '/src/pages/Home.tsx',
      errors: [{ messageId: 'noTestAttr', data: { attr: 'data-testid' } }],
    },
  ],
});
