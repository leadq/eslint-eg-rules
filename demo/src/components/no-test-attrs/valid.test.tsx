// ✅ VALID: Test attributes ARE allowed in test files (identified by .test.tsx)
import { describe, it } from 'vitest';

export const TestSubjectMock = () => (
  // "data-testid" is allowed because this filename clearly ends with .test.tsx
  <div data-testid="mock-subject" />
);

describe('no-test-attrs', () => {
  it('should ignore test files', () => {
    // A rendered element in tests with a test ID
    const myMockElement = <button data-cy="click-me">Click It</button>;
    console.log(myMockElement);
  });
});
