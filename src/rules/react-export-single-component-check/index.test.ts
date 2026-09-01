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

ruleTester.run('react-export-single-component-check', rule, {
  valid: [
    // 1. Single function component
    {
      code: `
        export function Button({ label }: { label: string }) {
          return <button>{label}</button>;
        }
      `,
      filename: '/src/components/Button.tsx',
    },
    // 2. Single arrow function component
    {
      code: `
        export const Card = ({ title }: { title: string }) => {
          return <div className="card">{title}</div>;
        };
      `,
      filename: '/src/components/Card.tsx',
    },
    // 3. Single component with helper camelCase functions
    {
      code: `
        export function formatLabel(text: string) {
          return text.trim();
        }

        export function Badge({ text }: { text: string }) {
          return <span>{formatLabel(text)}</span>;
        }
      `,
      filename: '/src/components/Badge.tsx',
    },
    // 4. Single component with types, interface, enum, and constants
    {
      code: `
        export type ButtonProps = { label: string };
        export interface OtherProps { id: string }
        export enum ButtonVariant { Primary, Secondary }
        export const DEFAULT_VARIANT = 'primary';
        export const MyConst = 42;

        export function Button({ label }: ButtonProps) {
          return <button>{label}</button>;
        }
      `,
      filename: '/src/components/Button.tsx',
    },
    // 5. Single component wrapped with React.memo
    {
      code: `
        export const MemoButton = React.memo(({ label }: { label: string }) => (
          <button>{label}</button>
        ));
      `,
      filename: '/src/components/MemoButton.tsx',
    },
    // 6. Single component wrapped with React.forwardRef
    {
      code: `
        export const CustomInput = React.forwardRef<HTMLInputElement, { value: string }>((props, ref) => (
          <input ref={ref} value={props.value} />
        ));
      `,
      filename: '/src/components/CustomInput.tsx',
    },
    // 7. Single component wrapped with React.lazy
    {
      code: `
        export const LazyModal = React.lazy(() => import('./Modal'));
      `,
      filename: '/src/components/LazyModal.tsx',
    },
    // 8. Single component with direct memo / forwardRef / lazy imports
    {
      code: `
        export const MemoCard = memo(() => <div />);
      `,
      filename: '/src/components/MemoCard.tsx',
    },
    // 9. Re-exports from other files with moduleSpecifier (from clause) are ignored
    {
      code: `
        export { Button as AliasButton } from './button';
        export { Card } from './card';
      `,
      filename: '/src/components/reexports.tsx',
    },
    // 10. Compound subcomponents allowed when compound option is true
    {
      code: `
        export function Card() {
          return <div>Card</div>;
        }

        export function CardHeader() {
          return <div>Header</div>;
        }

        export function CardBody() {
          return <div>Body</div>;
        }
      `,
      filename: '/src/components/Card.tsx',
      options: [{ compound: true }],
    },
    // 10. export default is ignored
    {
      code: `
        export default function MyComponent() {
          return <div />;
        }
      `,
      filename: '/src/components/MyComponent.tsx',
    },
    // 11. Compound component pattern (subcomponent is NOT exported)
    {
      code: `
        export function Accordion({ children }: { children: React.ReactNode }) {
          return <div>{children}</div>;
        }

        function AccordionItem({ label }: { label: string }) {
          return <li>{label}</li>;
        }

        Accordion.Item = AccordionItem;
      `,
      filename: '/src/components/Accordion.tsx',
    },
    // 12. Component with custom hook and util exported together
    {
      code: `
        export function useAccordionState(defaultOpen: boolean) {
          const [open, setOpen] = React.useState(defaultOpen);
          return { open, setOpen };
        }

        export function normalizeLabel(label: string) {
          return label.trim().toLowerCase();
        }

        export function Accordion({ label }: { label: string }) {
          const { open } = useAccordionState(false);
          return <div aria-expanded={open}>{normalizeLabel(label)}</div>;
        }
      `,
      filename: '/src/components/Accordion.tsx',
    },
    // 13. Imported and re-exported symbol + one local component
    {
      code: `
        import { ExternalButton } from './ExternalButton';
        export { ExternalButton };

        export function MyCard() {
          return <div />;
        }
      `,
      filename: '/src/components/MyCard.tsx',
    },
    // 14. Barrel file index.tsx is ignored
    {
      code: `
        export function Header() { return <header />; }
        export function Footer() { return <footer />; }
      `,
      filename: '/src/components/index.tsx',
    },
    // 15. App.tsx is ignored
    {
      code: `
        export function Header() { return <header />; }
        export function App() { return <main />; }
      `,
      filename: '/src/App.tsx',
    },
    // 16. main.tsx is ignored
    {
      code: `
        export function Root() { return <div />; }
        export function App() { return <div />; }
      `,
      filename: '/src/main.tsx',
    },
    // 17. Test files (*.test.tsx, *.spec.tsx, __tests__/) are ignored
    {
      code: `
        export function MockA() { return <div />; }
        export function MockB() { return <div />; }
      `,
      filename: '/src/components/Button.test.tsx',
    },
    {
      code: `
        export function MockA() { return <div />; }
        export function MockB() { return <div />; }
      `,
      filename: '/src/components/Button.spec.tsx',
    },
    {
      code: `
        export function MockA() { return <div />; }
        export function MockB() { return <div />; }
      `,
      filename: '/src/components/__tests__/Button.tsx',
    },
    // 18. Storybook files (*.stories.tsx, *.story.tsx) are ignored
    {
      code: `
        export function StoryA() { return <div />; }
        export function StoryB() { return <div />; }
      `,
      filename: '/src/components/Button.stories.tsx',
    },
    {
      code: `
        export function StoryA() { return <div />; }
        export function StoryB() { return <div />; }
      `,
      filename: '/src/components/Button.story.tsx',
    },
    // 19. Non-.tsx files are ignored
    {
      code: `
        export function CompA() { return 1; }
        export function CompB() { return 2; }
      `,
      filename: '/src/utils/helpers.ts',
    },
    // 20. Single local component exported via export { LocalComp }
    {
      code: `
        const Header = () => <header />;
        export { Header };
      `,
      filename: '/src/components/Header.tsx',
    },
    // 21. Single local component exported with alias
    {
      code: `
        const InternalHeader = () => <header />;
        export { InternalHeader as Header };
      `,
      filename: '/src/components/Header.tsx',
    },
    // 22. Component with type assertion (as React.FC)
    {
      code: `
        export const ActionButton = (() => <button />) as React.FC;
      `,
      filename: '/src/components/ActionButton.tsx',
    },
    // 23. Component with satisfies expression
    {
      code: `
        export const ActionButton = (() => <button />) satisfies React.FC;
      `,
      filename: '/src/components/ActionButton.tsx',
    },
    // 24. Single class component
    {
      code: `
        export class MainHeader extends React.Component {
          render() { return <header />; }
        }
      `,
      filename: '/src/components/MainHeader.tsx',
    },
    // 25. Single async Server Component
    {
      code: `
        export async function UserList() {
          return <ul><li>User</li></ul>;
        }
      `,
      filename: '/src/components/UserList.tsx',
    },
    // 26. Single generic component
    {
      code: `
        export const ItemList = <T,>({ items }: { items: T[] }) => {
          return <div>{items.length}</div>;
        };
      `,
      filename: '/src/components/ItemList.tsx',
    },
    // 27. Re-exporting default import is ignored
    {
      code: `
        import DefaultButton from './DefaultButton';
        export { DefaultButton };

        export function MyWidget() {
          return <div />;
        }
      `,
      filename: '/src/components/MyWidget.tsx',
    },
    // 28. Re-exporting namespace import is ignored
    {
      code: `
        import * as Icons from './icons';
        export { Icons };

        export function MyWidget() {
          return <div />;
        }
      `,
      filename: '/src/components/MyWidget.tsx',
    },
    // 29. Re-exporting aliased import is ignored
    {
      code: `
        import { Button as InternalButton } from './btn';
        export { InternalButton as Button };

        export function MyWidget() {
          return <div />;
        }
      `,
      filename: '/src/components/MyWidget.tsx',
    },
  ],
  invalid: [
    // 1. Two function components in one file
    {
      code: `
        export function PrimaryButton({ label }: { label: string }) {
          return <button className="primary">{label}</button>;
        }

        export function SecondaryButton({ label }: { label: string }) {
          return <button className="secondary">{label}</button>;
        }
      `,
      filename: '/src/components/Buttons.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'SecondaryButton',
          },
        },
      ],
    },
    // 2. Function component + arrow function component
    {
      code: `
        export function Card() {
          return <div className="card" />;
        }

        export const CardFooter = () => <footer />;
      `,
      filename: '/src/components/Card.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'CardFooter',
          },
        },
      ],
    },
    // 3. Multiple local components exported via export { A, B }
    {
      code: `
        const Header = () => <header />;
        const Footer = () => <footer />;

        export { Header, Footer };
      `,
      filename: '/src/components/Layout.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'Footer',
          },
        },
      ],
    },
    // 4. Sub-component in compound component is also exported
    {
      code: `
        export function Accordion() { return <div />; }
        export function AccordionItem() { return <li />; }
        Accordion.Item = AccordionItem;
      `,
      filename: '/src/components/Accordion.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'AccordionItem',
          },
        },
      ],
    },
    // 5. Three components in one file -> flags 2nd and 3rd
    {
      code: `
        export function ComponentOne() { return <div />; }
        export const ComponentTwo = () => <div />;
        export const ComponentThree = React.memo(() => <div />);
      `,
      filename: '/src/components/Multi.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'ComponentTwo',
          },
        },
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'ComponentThree',
          },
        },
      ],
    },
    // 6. Export declared before function definitions
    {
      code: `
        export { Header, Footer };

        function Header() { return <header />; }
        function Footer() { return <footer />; }
      `,
      filename: '/src/components/Layout.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'Footer',
          },
        },
      ],
    },
    // 7. Multiple class components exported
    {
      code: `
        export class Header extends React.Component { render() { return <header />; } }
        export class Footer extends React.Component { render() { return <footer />; } }
      `,
      filename: '/src/components/Layout.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'Footer',
          },
        },
      ],
    },
    // 8. Multiple components with type assertions
    {
      code: `
        export const PrimaryButton = (() => <button />) as React.FC;
        export const SecondaryButton = (() => <button />) as React.FC;
      `,
      filename: '/src/components/Buttons.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'SecondaryButton',
          },
        },
      ],
    },
    // 9. Multiple async Server Components
    {
      code: `
        export async function UserHeader() { return <header />; }
        export async function UserFooter() { return <footer />; }
      `,
      filename: '/src/components/User.tsx',
      errors: [
        {
          messageId: 'singleComponentExport',
          data: {
            componentName: 'UserFooter',
          },
        },
      ],
    },
  ],
});
