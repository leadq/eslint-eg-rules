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

ruleTester.run('react-component-props-naming-check', rule, {
  valid: [
    // 1. Valid exact name in FunctionDeclaration
    {
      code: `
        interface LoginProps { username: string }
        function Login(props: LoginProps) {
          return <form>{props.username}</form>;
        }
      `,
      filename: '/src/components/Login.tsx',
    },
    // 2. Valid exact name in ArrowFunction
    {
      code: `
        interface ActionButtonProps { label: string }
        const ActionButton = (props: ActionButtonProps) => {
          return <button>{props.label}</button>;
        };
      `,
      filename: '/src/components/ActionButton.tsx',
    },
    // 3. PropsWithChildren wrapper
    {
      code: `
        interface CardProps { title: string }
        const Card = (props: PropsWithChildren<CardProps>) => {
          return <div><h2>{props.title}</h2>{props.children}</div>;
        };
      `,
      filename: '/src/components/Card.tsx',
    },
    // 4. React.PropsWithChildren wrapper
    {
      code: `
        interface CardProps { title: string }
        const Card = (props: React.PropsWithChildren<CardProps>) => {
          return <div><h2>{props.title}</h2>{props.children}</div>;
        };
      `,
      filename: '/src/components/Card.tsx',
    },
    // 5. Intersection type with HTMLAttributes
    {
      code: `
        interface LoginProps { onLogin: () => void }
        const Login = (props: LoginProps & React.HTMLAttributes<HTMLDivElement>) => {
          return <div {...props} />;
        };
      `,
      filename: '/src/components/Login.tsx',
    },
    // 6. Intersection type reversed
    {
      code: `
        interface LoginProps { onLogin: () => void }
        const Login = (props: React.HTMLAttributes<HTMLDivElement> & LoginProps) => {
          return <div {...props} />;
        };
      `,
      filename: '/src/components/Login.tsx',
    },
    // 7. No props parameter
    {
      code: `
        const Header = () => <header>Site Header</header>;
      `,
      filename: '/src/components/Header.tsx',
    },
    // 8. No type annotation
    {
      code: `
        const Header = (props) => <header>Site Header</header>;
      `,
      filename: '/src/components/Header.tsx',
    },
    // 9. Built-in HTML attribute type only
    {
      code: `
        const Wrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
          return <div {...props} />;
        };
      `,
      filename: '/src/components/Wrapper.tsx',
    },
    // 10. ButtonHTMLAttributes
    {
      code: `
        const CustomButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
          return <button {...props} />;
        };
      `,
      filename: '/src/components/CustomButton.tsx',
    },
    // 11. ComponentProps utility type
    {
      code: `
        const CustomButton = (props: ComponentProps<typeof Button>) => {
          return <button {...props} />;
        };
      `,
      filename: '/src/components/CustomButton.tsx',
    },
    // 12. Inline object type (ignored)
    {
      code: `
        const Badge = ({ text }: { text: string }) => <span>{text}</span>;
      `,
      filename: '/src/components/Badge.tsx',
    },
    // 13. Hook function (ignored)
    {
      code: `
        const useAuth = (config: AuthConfig) => ({ isLoggedIn: true });
      `,
      filename: '/src/hooks/useAuth.tsx',
    },
    // 14. camelCase helper function (ignored)
    {
      code: `
        const validateForm = (state: FormState) => state.email.includes('@');
      `,
      filename: '/src/components/validateForm.tsx',
    },
    // 15. render helper function (ignored)
    {
      code: `
        const renderListItem = (item: ItemData) => <li>{item.label}</li>;
      `,
      filename: '/src/components/renderListItem.tsx',
    },
    // 16. PascalCase non-JSX returning function (ignored)
    {
      code: `
        const CreateService = (config: ServiceConfig): Service => new Service();
      `,
      filename: '/src/components/CreateService.tsx',
    },
    // 17. React.memo with valid props
    {
      code: `
        interface CardProps { title: string }
        const Card = React.memo((props: CardProps) => {
          return <div>{props.title}</div>;
        });
      `,
      filename: '/src/components/Card.tsx',
    },
    // 18. React.forwardRef with generic type arguments
    {
      code: `
        interface InputProps { value: string }
        const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
          return <input ref={ref} value={props.value} />;
        });
      `,
      filename: '/src/components/Input.tsx',
    },
    // 19. React.forwardRef with param type annotation
    {
      code: `
        interface InputProps { value: string }
        const Input = React.forwardRef((props: InputProps, ref) => {
          return <input ref={ref} value={props.value} />;
        });
      `,
      filename: '/src/components/Input.tsx',
    },
    // 20. React.FC with valid props
    {
      code: `
        interface LoginProps { username: string }
        const Login: React.FC<LoginProps> = (props) => {
          return <form>{props.username}</form>;
        };
      `,
      filename: '/src/components/Login.tsx',
    },
    // 21. Ignored in test files
    {
      code: `
        interface LoginData { username: string }
        function Login(props: LoginData) {
          return <form>{props.username}</form>;
        }
      `,
      filename: '/src/components/Login.test.tsx',
    },
    // 22. Ignored in __tests__ directory
    {
      code: `
        interface LoginData { username: string }
        function Login(props: LoginData) {
          return <form>{props.username}</form>;
        }
      `,
      filename: '/src/components/__tests__/Login.tsx',
    },
    // 23. Ignored in apis directory
    {
      code: `
        interface LoginData { username: string }
        function Login(props: LoginData) {
          return <form>{props.username}</form>;
        }
      `,
      filename: '/src/apis/Login.tsx',
    },
    // 24. Ignored in non-.tsx files (.ts file ignored even with invalid props type)
    {
      code: `
        interface LoginData { username: string }
        function Login(props: LoginData) {
          return props.username;
        }
      `,
      filename: '/src/components/Login.ts',
    },
  ],
  invalid: [
    // 1. FunctionDeclaration with wrong prop type
    {
      code: `
        interface LoginData { username: string }
        function Login(props: LoginData) {
          return <form>{props.username}</form>;
        }
      `,
      filename: '/src/components/Login.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Login',
            actualType: 'LoginData',
          },
        },
      ],
    },
    // 2. Arrow function component with wrong prop type
    {
      code: `
        interface ButtonSettings { label: string }
        const ActionButton = (props: ButtonSettings) => {
          return <button>{props.label}</button>;
        };
      `,
      filename: '/src/components/ActionButton.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'ActionButton',
            actualType: 'ButtonSettings',
          },
        },
      ],
    },
    // 3. React.memo wrapper with wrong prop type
    {
      code: `
        interface CardData { title: string }
        const Card = React.memo((props: CardData) => {
          return <div>{props.title}</div>;
        });
      `,
      filename: '/src/components/Card.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Card',
            actualType: 'CardData',
          },
        },
      ],
    },
    // 4. React.forwardRef with wrong generic prop type
    {
      code: `
        interface InputOptions { value: string }
        const Input = React.forwardRef<HTMLInputElement, InputOptions>((props, ref) => {
          return <input ref={ref} value={props.value} />;
        });
      `,
      filename: '/src/components/Input.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Input',
            actualType: 'InputOptions',
          },
        },
      ],
    },
    // 5. PropsWithChildren with wrong inner type
    {
      code: `
        interface CardData { title: string }
        const Card = (props: PropsWithChildren<CardData>) => {
          return <div><h2>{props.title}</h2>{props.children}</div>;
        };
      `,
      filename: '/src/components/Card.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Card',
            actualType: 'CardData',
          },
        },
      ],
    },
    // 6. Intersection with non-matching types
    {
      code: `
        interface LoginData { username: string }
        interface SomeData { token: string }
        const Login = (props: LoginData & SomeData) => {
          return <div {...props} />;
        };
      `,
      filename: '/src/components/Login.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Login',
            actualType: 'LoginData',
          },
        },
      ],
    },
    // 7. Intersection with wrong custom type and HTMLAttributes
    {
      code: `
        interface LoginData { username: string }
        const Login = (props: LoginData & React.HTMLAttributes<HTMLDivElement>) => {
          return <div {...props} />;
        };
      `,
      filename: '/src/components/Login.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Login',
            actualType: 'LoginData',
          },
        },
      ],
    },
    // 8. React.FC with wrong prop type
    {
      code: `
        interface LoginData { username: string }
        const Login: React.FC<LoginData> = (props) => {
          return <form>{props.username}</form>;
        };
      `,
      filename: '/src/components/Login.tsx',
      errors: [
        {
          messageId: 'invalidPropType',
          data: {
            componentName: 'Login',
            actualType: 'LoginData',
          },
        },
      ],
    },
  ],
});
