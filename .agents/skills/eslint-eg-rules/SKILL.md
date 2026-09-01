---
name: eslint-eg-rules
description: Custom ESLint plugin rules for React + TypeScript projects. These will be mostly checking naming conventions about functions, components, props, hooks, api types, etc.
---

# Coding Rules (eg-rules)

This project uses `eslint-plugin-eg-rules`. Follow the rules below when writing code.

---

## 1. `api-type-suffix` — API Type Naming

All `interface` and `type` declarations inside `src/apis/` must end with `Model`, `Response`, or `Request`. Consecutive suffixes are not allowed.

```ts
// ✅
interface UserModel {}
type LoginResponse = {}

// ❌
interface User {}              // missing suffix
interface UserRequestModel {}  // consecutive suffixes
```

---

## 2. `boolean-prop-naming` — Boolean Prop Prefixes

In `components/`, `hooks/`, and `utils/`, boolean props and parameters must start with: `is`, `has`, `can`, `should`, `will`, `did`, `show`, or `hide`.

```ts
// ✅
interface Props { isOpen: boolean; hasError?: boolean }
function useModal(isVisible: boolean) {}

// ❌
interface Props { open: boolean }
function useModal(visible: boolean) {}
```

---

## 3. `component-callback-naming` — Callback Prop Prefix

Callback function props in React component prop types must start with `on`. Past-tense endings (e.g. `onClicked`) are not allowed by default.

```ts
// ✅
interface Props { onClick: () => void; onSubmit: (v: string) => void }

// ❌
interface Props { click: () => void }     // missing 'on'
interface Props { onClicked: () => void } // past tense
```

---

## 4. `functions-naming` — Function Return-Based Naming

Functions must be named based on what they return. React components, hooks (`use*`), and event handlers (`handle*`, `on*`) are exempt.

| Returns          | Required prefix            |
|------------------|----------------------------|
| JSX              | `render`                   |
| `boolean`        | `is`, `has`, `will`, `can` |
| string/number/object/array | `get`, `calculate`, `determine` |

```ts
// ✅
const renderCard = () => <Card />;
const isValid = (): boolean => true;
const getUser = (): User => ({ ... });

// ❌
const card = () => <Card />;
const valid = (): boolean => true;
const user = (): User => ({ ... });
```

---

## 5. `jsx-event-handler-naming` — JSX Handler Naming

Locally defined handlers passed to JSX event props must start with `handle`. In strict mode (default), the handler name must also end with the event name.

```tsx
// ✅
const handleClick = () => {};
<Button onClick={handleClick} />

// ❌
const doClick = () => {};
<Button onClick={doClick} /> // missing 'handle'

// ❌ (strict mode)
const handleSubmit = () => {};
<Input onChange={handleSubmit} /> // should end with 'Change'
```

---

## 6. `react-component-layout` — Component Declaration Order

Declarations inside React components must follow this order:

```
0. Props destructuring      → const { id } = props
1. Priority hooks           → useLocation, useNavigate, useTranslation
2. Context hooks            → useXxxContext()
3. State hooks              → useState, useReducer
4. Query/Mutation hooks     → useQuery, useMutation
5. Custom hooks             → useForm, useDebounce
6. Effect hooks             → useEffect, useMemo, useCallback
7. Utility functions        → const getLabel = () => ...
8. Event handlers           → const handleClick = () => ...
9. View values              → const title = isLoading ? '...' : name
10. Early returns           → if (!data) return null
11. JSX return              → return <div>...</div>
```

Dependency values (plain derived variables not used in JSX) are exempt from ordering.
State hooks (3), utility functions (7), and event handlers (8) must each be grouped contiguously.

```tsx
// ✅
function UserCard({ userId }: Props) {
  const { t } = useTranslation();           // 1
  const { user } = useUserContext();        // 2
  const [count, setCount] = useState(0);   // 3
  const { data } = useUserQuery(userId);   // 4
  useEffect(() => {}, []);                 // 6
  const handleClick = () => {};            // 8
  const label = data?.name ?? 'N/A';       // 9
  return <div>{label}</div>;               // 11
}

// ❌ — useState before useTranslation
function UserCard({ userId }: Props) {
  const [count, setCount] = useState(0);
  const { t } = useTranslation();
  ...
}
```

---

## 7. `test-statement-match` — Test Description Format

In test files (`.test.*`, `.spec.*`, `__tests__/`):
- `it(...)` descriptions must start with `"should "`
- `test(...)` descriptions must include a conjunction: `if`, `when`, `while`, `after`, `before`, `with`, `without`, `unless`, `since`, `until`, `for`, `during`

```ts
// ✅
it('should return null when empty', () => {});
test('returns the user when id is valid', () => {});

// ❌
it('returns null', () => {});                  // missing 'should'
test('returns the user for valid id', () => {}); // no conjunction
```

---

## 8. `no-test-attrs` — Disallow Test Attributes

Disallow the use of test-only attributes (e.g. `data-testid`, `data-cy`) inside regular source files like components or utilities. These attributes are only permitted inside test files (e.g. `.test.ts`, `.spec.tsx`) and the `__tests__` directory.

```tsx
// ✅ (inside a .test.tsx file)
<button data-testid="submit-btn" />

// ❌ (inside a regular component file e.g. Button.tsx)
<button data-testid="submit-btn" />
<div data-cy="container" />
```

---

## 9. `react-bem-naming` — React Component BEM Classes

Enforces BEM naming methodology for React component class names natively or with CSS modules.

- Modes: `kebab-case`, `camelCase`, `strict`.
- Strict mode strictly enforces the `block` name to match the parent React component and strictly permits BEM nested element chaining inside CSS Modules.

```tsx
// ✅ (strict mode)
const SortableHeaderCell = () => <th className={styles.sortableHeaderCell__content--active} />;

// ❌ (strict mode: block doesn't match React component Name)
const SortableHeaderCell = () => <th className={styles.table__th} />;
```

---

## 10. `util-hook-single-export` — Single Responsibility for Utils and Hooks

Enforces Single Responsibility in `utils/` and `hooks/` directories: at most one exported function or hook per file, disallows collector files (`*Utils.ts`, `helpers.ts`), forbids default exports, and ensures the export name matches the file name.

```ts
// ✅
// /src/utils/date/formatDate.ts
export const formatDate = (date: Date): string => { ... };

// /src/utils/calculateBalance.ts (Unexported private helpers are allowed)
const getData = () => { ... };
export const calculateBalance = () => { ... };

// ❌
// /src/utils/date/formatDate.ts (Multiple exported functions)
export const formatDate = (date: Date) => { ... };
export const getDayDiff = (a: Date, b: Date) => { ... };

// /src/utils/dateUtils.ts (Banned collector file name)
export const formatDate = (date: Date) => { ... };

// /src/utils/calculateBalance.ts (Default export forbidden)
export default function calculateBalance() { ... }
```

---

## 11. `util-hook-colocation` — Colocation Boundaries for Component Helpers

Enforces that local utils and hooks located inside component folders (`components/X/utils/*`, `components/X/hooks/*`) cannot be imported outside the `components/X/` subtree.

```ts
// ✅
// /src/components/AccountDetail/index.tsx
import { formatAccountNumber } from './utils/formatAccountNumber';

// /src/components/AccountDetail/TransactionList/index.tsx (Child component)
import { formatAccountNumber } from '../utils/formatAccountNumber';

// ❌
// /src/components/TransactionList/index.tsx (Sibling component)
import { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';

// /src/pages/Dashboard/index.tsx (External page)
import { useAccountDetail } from '../../components/AccountDetail/hooks/useAccountDetail';
```

---

## 12. `react-component-props-naming-check` — Component Props Type Naming

Verifies that props types passed to React component functions follow the `{ComponentName}Props` naming convention.

- Applies to PascalCase functions returning JSX (`returnsJSX` check).
- Supports standard functions, arrow functions, `React.memo`, and `React.forwardRef`.
- Supports `PropsWithChildren<{ComponentName}Props>` wrappers and intersections (`{ComponentName}Props & React.HTMLAttributes<T>`).
- Ignores components without props, untyped props, inline object types (`{ text: string }`), hook functions (`use*`), render helpers (`render*`), non-JSX functions, test files, and `apis/` files.

```tsx
// ✅
interface LoginProps { username: string }
function Login(props: LoginProps) { return <form>{props.username}</form>; }

interface CardProps { title: string }
const Card = (props: PropsWithChildren<CardProps>) => <div>{props.children}</div>;

// ❌
interface LoginData { username: string }
function Login(props: LoginData) { return <form>{props.username}</form>; } // should be LoginProps

interface ButtonSettings { label: string }
const ActionButton = (props: ButtonSettings) => <button>{props.label}</button>; // should be ActionButtonProps
```

---

## 13. `react-export-single-component-check` — Single Component Export per File

Enforces that each React component file (`.tsx`) exports at most one React component. Multiple component exports violate Single Responsibility and hinder component organization.

- Checks `export function`, `export const` (arrow function, `React.memo`, `React.forwardRef`, `React.lazy`), and local `export { LocalComp }`.
- Automatically ignores barrel files (`index.tsx`), app entry points (`main.tsx`, `App.tsx`), test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`), storybook files (`*.stories.tsx`), and non-TSX files (`.ts`, `.js`).
- Allows a single component with helper `camelCase` functions, custom hooks (`use*`), types/interfaces, enums, and constants.
- Supports the Compound Component pattern where subcomponents are attached to the parent without being separately exported (`Accordion.Item = AccordionItem`).

```tsx
// ✅
export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}

// ✅ (compound component pattern)
export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}
function AccordionItem({ label }: ItemProps) {
  return <li>{label}</li>;
}
Accordion.Item = AccordionItem;

// ❌ (multiple function components exported)
export function PrimaryButton({ label }: { label: string }) {
  return <button className="primary">{label}</button>;
}
export function SecondaryButton({ label }: { label: string }) {
  return <button className="secondary">{label}</button>;
}

// ❌ (arrow function exported as second component)
export function Card() { return <div className="card" />; }
export const CardFooter = () => <footer />;
```

---

## 14. ESLint v8 / v9 Compatibility Rules
All rules developed or modified in this plugin must maintain native compatibility with both ESLint v8 and ESLint v9.

### Coding guidelines:
* **Context Methods:** Never call deprecated/removed methods directly on the `context` object (e.g. `context.getSourceCode()`, `context.getScope()`, `context.getFilename()`).
* **SourceCode Fallback:** Always resolve properties lazily with fallbacks:
  ```typescript
  const sourceCode = context.sourceCode || context.getSourceCode();
  const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();
  const filename = context.filename ?? context.getFilename();
  ```
* **Rule Definitions:** Every rule must be defined as an object exporting `meta` and `create` (no function-style rules). Rules that accept options must define a schema `meta.schema` (even if empty `[]`).

### Testing guidelines:
* **RuleTester Autofix Output:** When testing rules that perform autofixing, you **must** specify the expected `output` in all `invalid` test cases, as ESLint v9's `RuleTester` strictly validates autofix outputs.

