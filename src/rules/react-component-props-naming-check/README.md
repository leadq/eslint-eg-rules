# Enforce `{ComponentName}Props` naming convention for React component props (`react-component-props-naming-check`)

This rule verifies that props types passed to React components strictly follow the `{ComponentName}Props` naming convention.

## Rule Details

This rule applies to PascalCase functions that actually return JSX (`returnsJSX` check). It handles standard functions, arrow functions, and wrappers like `React.memo` and `React.forwardRef`.

Target files: `.tsx` files (excluding test files and `apis/` files).

### Examples

👎 Examples of **incorrect** code:

```tsx
interface LoginData { username: string }
function Login(props: LoginData) {
  return <form>{props.username}</form>;
}

interface ButtonSettings { label: string }
const ActionButton = (props: ButtonSettings) => {
  return <button>{props.label}</button>;
};

interface CardData { title: string }
const Card = React.memo((props: CardData) => {
  return <div>{props.title}</div>;
});

interface InputOptions { value: string }
const Input = React.forwardRef<HTMLInputElement, InputOptions>((props, ref) => {
  return <input ref={ref} value={props.value} />;
});
```

👍 Examples of **correct** code:

```tsx
interface LoginProps { username: string }
function Login(props: LoginProps) {
  return <form>{props.username}</form>;
}

interface CardProps { title: string }
const Card = (props: PropsWithChildren<CardProps>) => {
  return <div><h2>{props.title}</h2>{props.children}</div>;
};

interface LoginProps { onLogin: () => void }
const Login = (props: LoginProps & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};

const Header = () => <header>Site Header</header>;

const Wrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};
```

### Ignored Cases

- Non-JSX returning functions (`createService`, utilities)
- camelCase helper functions (`validateForm`, `renderListItem`)
- Hook functions (`useAuth`)
- Inline object types (`const Badge = ({ text }: { text: string }) => ...`)
- Components without props or without type annotations
- Test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`)
