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
