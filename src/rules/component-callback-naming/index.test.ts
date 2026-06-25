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

ruleTester.run('component-callback-naming', rule as any, {
  valid: [
    // 1. Used in Component, valid name
    {
      code: `
        interface ButtonProps {
          onClick: () => void;
        }
        const Button = ({onClick}: ButtonProps) => { return null; }
      `,
    },
    // 2. Not used in Component, so the rule shouldn't check it (ignored)
    {
      code: `
        interface ButtonProps {
          refetch: () => void;
        }
        // Button is lowercase, so it's not detected as a React Component intentionally
        // testing the "ignore if not passed as props" feature
        const button = ({refetch}: ButtonProps) => { return null; }
      `,
    },
    // 3. Different function declaration style, valid name
    {
      code: `
        interface ModalProps {
          onCloseClick: () => void;
        }
        function Modal(props: ModalProps) { return null; }
      `,
    },
    // 4. React.FC style, valid name
    {
      code: `
        interface InputProps {
          onChange: () => void;
          value: string; // not a function, should be ignored
        }
        const Input: React.FC<InputProps> = ({onChange, value}) => { return null; }
      `,
    },
    // 5. Method signature in interface instead of property signature
    {
      code: `
        interface InputProps {
          onBlur(): void;
        }
        const Input: FC<InputProps> = ({onBlur}) => { return null; }
      `,
    },
    // 6. Valid past tense when allowPastTense is true
    {
      code: `
        interface ButtonProps {
          onClicked: () => void;
        }
        const Button = ({onClicked}: ButtonProps) => { return null; }
      `,
      options: [{ allowPastTense: true }],
    },
    // 7. Custom app-specific event that starts with "on"
    {
      code: `
        interface ButtonProps {
          onRefetch: () => void;
        }
        const Button = ({onRefetch}: ButtonProps) => { return null; }
      `,
    },
    // 8. Whitelisted event overriding past tense
    {
      code: `
        interface ButtonProps {
          onAgreed: () => void;
          onClicked: () => void; // override default past tense block for 'Clicked'
        }
        const Button = ({onAgreed, onClicked}: ButtonProps) => { return null; }
      `,
      options: [{ whitelist: ['Agreed', 'Clicked'] }],
    },
    // 9. Blacklist check passing (event doesn't match blacklist)
    {
      code: `
        interface ButtonProps {
          onProceed: () => void;
        }
        const Button = ({onProceed}: ButtonProps) => { return null; }
      `,
      options: [{ blacklist: ['Finished'] }],
    },
  ],
  invalid: [
    // 1. Missing "on" prefix
    {
      code: `
        interface ButtonProps {
          refetch: () => void;
        }
        const Button = ({refetch}: ButtonProps) => { return null; }
      `,
      errors: [
        {
          messageId: 'invalidCallbackProp',
          data: { name: 'refetch' },
        },
      ],
    },
    // 3. Method signature invalid
    {
      code: `
        interface ButtonProps {
          submit(): void;
        }
        const Button = ({submit}: ButtonProps) => { return null; }
      `,
      errors: [
        {
          messageId: 'invalidCallbackProp',
          data: { name: 'submit' },
        },
      ],
    },
    // 4. Past tense usage (default behavior: not allowed)
    {
      code: `
        interface ButtonProps {
          onClicked: () => void;
        }
        const Button = ({onClicked}: ButtonProps) => { return null; }
      `,
      errors: [
        {
          messageId: 'pastTenseEvent',
          data: { name: 'onClicked', event: 'Click', pastTense: 'Clicked' },
        },
      ],
    },
    // 5. Another past tense usage (changed)
    {
      code: `
        interface InputProps {
          onThatChanged: () => void;
        }
        const Input = ({onThatChanged}: InputProps) => { return null; }
      `,
      errors: [
        {
          messageId: 'pastTenseEvent',
          data: { name: 'onThatChanged', event: 'Change', pastTense: 'Changed' },
        },
      ],
    },
    // 6. Blacklisted custom event
    {
      code: `
        interface ButtonProps {
          onFinished: () => void;
        }
        const Button = ({onFinished}: ButtonProps) => { return null; }
      `,
      options: [{ blacklist: ['Finished'] }],
      errors: [
        {
          messageId: 'blacklistedEvent',
          data: { name: 'onFinished', suffix: 'Finished' },
        },
      ],
    },
    // 7. Whitelisted event passing but another blacklisted failing
    {
      code: `
        interface ButtonProps {
          onAgreed: () => void;
          onFinished: () => void;
        }
        const Button = ({onAgreed, onFinished}: ButtonProps) => { return null; }
      `,
      options: [{ whitelist: ['Agreed'], blacklist: ['Finished'] }],
      errors: [
        {
          messageId: 'blacklistedEvent',
          data: { name: 'onFinished', suffix: 'Finished' },
        },
      ],
    },
  ],
});
