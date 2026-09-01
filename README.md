# eslint-plugin-strict-eg-rulez

A collection of custom ESLint rules for React + TypeScript projects. Designed to enforce consistency, readability, and maintainability across frontend codebases.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Category Presets](#category-presets)
- [Rules](#rules)
  - [api-type-suffix](#api-type-suffix)
  - [boolean-prop-naming](#boolean-prop-naming)
  - [component-callback-naming](#component-callback-naming)
  - [functions-naming](#functions-naming)
  - [jsx-event-handler-naming](#jsx-event-handler-naming)
  - [no-test-attrs](#no-test-attrs)
  - [no-unused-deps-in-hooks](#no-unused-deps-in-hooks)
  - [react-bem-naming](#react-bem-naming)
  - [react-component-layout](#react-component-layout)
  - [test-statement-match](#test-statement-match)
  - [util-hook-single-export](#util-hook-single-export)
  - [util-hook-colocation](#util-hook-colocation)
  - [react-component-props-naming-check](#react-component-props-naming-check)
  - [react-export-single-component-check](#react-export-single-component-check)
  - [no-upstream-imports](#no-upstream-imports)
  - [no-deep-relative-imports](#no-deep-relative-imports)
- [Development](#development)
- [Demo Project](#demo-project)
- [Adding a New Rule](#adding-a-new-rule)

---

## Installation

```bash
npm install eslint-plugin-strict-eg-rulez --save-dev
```

> **Peer dependency:** ESLint `>=8.0.0` is required.

---

## Usage

### Flat Config (`eslint.config.mjs`):

```js
import strictEgRulez from 'eslint-plugin-strict-eg-rulez';

export default [
  // Recommended (All rules enabled)
  strictEgRulez.configs['flat/recommended'],

  // Or selectively enable specific categories:
  // strictEgRulez.configs['flat/architecture'],
  // strictEgRulez.configs['flat/quality'],
  // strictEgRulez.configs['flat/naming'],
  // strictEgRulez.configs['flat/react'],
  // strictEgRulez.configs['flat/testing'],
];
```

### Legacy Config (`.eslintrc.cjs`):

```json
{
  "plugins": ["strict-eg-rulez"],
  "extends": [
    "plugin:strict-eg-rulez/recommended"
  ]
}
```

### Category Presets

| Preset | Category | Included Rules |
| :--- | :--- | :--- |
| `architecture` | 🏗️ Architecture | `util-hook-colocation`, `react-component-layout`, `no-upstream-imports` |
| `quality` | 💎 Quality | `util-hook-single-export`, `no-deep-relative-imports` |
| `naming` | 🏷️ Naming | `api-type-suffix`, `boolean-prop-naming`, `component-callback-naming`, `functions-naming`, `jsx-event-handler-naming`, `react-bem-naming`, `react-component-props-naming-check` |
| `react` | ⚛️ React | `react-export-single-component-check`, `no-unused-deps-in-hooks` |
| `testing` | 🧪 Testing | `test-statement-match`, `no-test-attrs` |
| `recommended` | 🌟 All | All rules across all categories enabled. |


---

## Rules

### `api-type-suffix`

Enforces that TypeScript `interface` and `type` declarations inside `src/apis/` end with an allowed suffix.

- **Default suffixes:** `Model`, `Response`, `Request`
- Consecutive suffixes are not allowed (e.g. `UserRequestModel` ❌)

```ts
// ✅ Valid
interface UserModel { ... }
type LoginResponse = { ... }

// ❌ Invalid
interface User { ... }              // Missing suffix
interface UserRequestModel { ... }  // Consecutive suffixes
```

**Options:**

```json
["error", { "suffixes": ["Model", "Response", "Request"] }]
```

| Option     | Type       | Default                              | Description              |
|------------|------------|--------------------------------------|--------------------------|
| `suffixes` | `string[]` | `["Model", "Response", "Request"]`   | Allowed suffixes list    |

---

### `boolean-prop-naming`

Enforces that boolean props and parameters in `components/`, `hooks/`, and `utils/` folders start with a boolean prefix.

- **Default prefixes:** `is`, `has`, `can`, `should`, `will`, `did`, `show`, `hide`
- Applies to TypeScript-typed booleans: `boolean`, `boolean | null`, `boolean | undefined`, `true | false`

```ts
// ✅ Valid
interface ButtonProps {
  isDisabled: boolean;
  hasError?: boolean;
}

// ❌ Invalid
interface ButtonProps {
  disabled: boolean; // Missing prefix
}
```

**Options:**

```json
["error", { "prefixes": ["is", "has", "can"] }]
```

| Option     | Type       | Default                                                             | Description           |
|------------|------------|---------------------------------------------------------------------|-----------------------|
| `prefixes` | `string[]` | `["is", "has", "can", "should", "will", "did", "show", "hide"]`    | Allowed prefixes list |

---

### `component-callback-naming`

Enforces that callback function props defined in React component prop types start with `on`.

- Also checks for past-tense event names (e.g. `onClicked` → use `onClick`) when `allowPastTense` is `false`
- Supports `blacklist` and `whitelist` for fine-grained control

```ts
// ✅ Valid
interface CardProps {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
}

// ❌ Invalid
interface CardProps {
  click: () => void;     // Missing 'on' prefix
  onClicked: () => void; // Past tense (when allowPastTense: false)
}
```

**Options:**

```json
["error", {
  "allowPastTense": false,
  "blacklist": ["Clicked"],
  "whitelist": ["onRefetch"]
}]
```

| Option          | Type       | Default | Description                                        |
|-----------------|------------|---------|----------------------------------------------------|
| `allowPastTense`| `boolean`  | `false` | Allow past tense event suffixes (e.g. `ed`/`d`)   |
| `blacklist`     | `string[]` | `[]`    | Disallowed suffixes (e.g. `Clicked`)               |
| `whitelist`     | `string[]` | `[]`    | Names always considered valid (bypass all checks)  |

---

### `functions-naming`

Enforces that functions are named according to their return type. React components, hooks, and event handlers are ignored.

| Return Type             | Required Prefix                     |
|-------------------------|-------------------------------------|
| JSX / ReactNode         | `render`                            |
| `boolean`               | `is`, `has`, `will`, `can`          |
| string / number / object / array | `get`, `calculate`, `determine` |

```ts
// ✅ Valid
const renderUserCard = () => <Card />;
const isLoggedIn = (): boolean => true;
const getUserName = (): string => 'John';

// ❌ Invalid
const userCard = () => <Card />;      // Missing 'render'
const loggedIn = (): boolean => true; // Missing boolean prefix
const userName = (): string => 'John'; // Missing value prefix
```

> This rule accepts no configuration options.

---

### `jsx-event-handler-naming`

Enforces that locally defined event handlers passed to JSX event props (e.g. `onClick`) start with `handle`. In `strict` mode, the handler name must also end with the event name.

```tsx
// ✅ Valid
const handleClick = () => {};
<Button onClick={handleClick} />

// ✅ Valid (strict: true)
const handleChange = () => {};
<Input onChange={handleChange} />

// ❌ Invalid — missing 'handle' prefix
const clickAction = () => {};
<Button onClick={clickAction} />

// ❌ Invalid — strict mode: must end with 'Change'
const handleSubmit = () => {};
<Input onChange={handleSubmit} />
```

**Options:**

```json
["error", { "strict": true }]
```

| Option   | Type      | Default | Description                                              |
|----------|-----------|---------|----------------------------------------------------------|
| `strict` | `boolean` | `true`  | Handler name must end with the corresponding event name  |

---

### `no-test-attrs`

Disallow test-only attributes (e.g. `data-testid`, `data-cy`) in non-test source files. These attributes should only appear in test files or test mocks.

- **Default forbidden attributes:** `data-testid`, `data-test`, `data-test-id`, `data-cy`, `data-e2e`
- Automatically ignores files ending with `.test.*`, `.spec.*`, or inside `__tests__/`

```tsx
// ✅ Valid (in any file)
<div className="card" id="main" />

// ✅ Valid (inside a test file like Button.test.tsx)
<button data-testid="submit-btn" type="submit" />

// ❌ Invalid (inside a normal component like Button.tsx)
<button data-testid="submit-btn" type="submit" />
<input data-cy="email-input" />
```

**Options:**

```json
["error", { "attrs": ["data-testid", "data-cy"] }]
```

| Option  | Type       | Default                                                             | Description                                         |
|---------|------------|---------------------------------------------------------------------|-----------------------------------------------------|
| `attrs` | `string[]` | `["data-testid", "data-test", "data-test-id", "data-cy", "data-e2e"]` | List of JSX attribute names considered test-only  |

---

### `react-bem-naming`

Enforces BEM naming methodology for React component class names, with strict checking for camelCase, kebab-case, or nested parent component names (`strict` mode).

- Supports `kebab-case`, `camelCase`, and `strict` modes.
- Strict mode forces `block` names to match the parent React component.
- Flags structural bad BEM practices (e.g. `___` or nesting elements like `block__el1__el2`).

```tsx
// ✅ Valid (strict mode)
const SortableHeaderCell = () => <th className={styles.sortableHeaderCell__content--active} />;

// ❌ Invalid (strict mode: root doesn't match component)
const SortableHeaderCell = () => <th className={styles.table__th} />;
```

**Options:**

```json
["error", { "mode": "strict" }]
```

| Option | Type                                     | Default        | Description                                               |
|--------|------------------------------------------|----------------|-----------------------------------------------------------|
| `mode` | `"kebab-case" \| "camelCase" \| "strict"` | `"kebab-case"` | The naming convention required for BEM blocks/elements   |

---

### `react-component-layout`

Enforces a specific declaration order inside React components. Based on Separation of Concerns (SoC) and MVVM principles. Supports **auto-fix** (`--fix`).

**Required order:**

| Group | Category             | Examples                                        |
|-------|----------------------|-------------------------------------------------|
| 0     | Props Destructuring  | `const { id, name } = props`                    |
| 1     | Priority Hooks       | `useLocation`, `useNavigate`, `useTranslation`  |
| 2     | Context Hooks        | `useThemeContext`, `useAuthContext`              |
| 3     | State Hooks          | `useState`, `useReducer`, `watch`               |
| 4     | Query/Mutation Hooks | `useQuery`, `useMutation`                       |
| 5     | Custom Hooks         | `useForm`, `useDebounce`                        |
| 6     | Effect Hooks         | `useEffect`, `useMemo`, `useCallback`           |
| 7     | Utility Functions    | `const getLabel = () => ...`                    |
| 8     | Event Handlers       | `const handleClick = () => ...`                 |
| 9     | View Values          | `const title = isLoading ? '...' : name`        |
| 10    | Early Returns        | `if (!data) return null`                        |
| 11    | JSX Return           | `return <div>...</div>`                         |

- **Dependency values** (group `-1`) are transparent — they can appear anywhere without triggering order violations.
- Groups **3** (State), **7** (Utility), and **8** (Handler) must be **contiguous** within themselves.
- Groups **9** (View Values) and **10** (Early Returns) may be freely swapped with each other.

> This rule accepts no configuration options.

---

### `test-statement-match`

Enforces naming conventions for `it` and `test` blocks in test files (`.test.*`, `.spec.*`, `__tests__/`).

- `it(...)` descriptions must start with `"should "`
- `test(...)` descriptions must contain a conjunction (`if`, `when`, `while`, etc.)

```ts
// ✅ Valid
it('should render the button', () => { ... });
test('returns null when data is empty', () => { ... });

// ❌ Invalid
it('renders the button', () => { ... });           // Missing 'should'
test('returns null for empty data', () => { ... }); // No conjunction
```

**Options:**

```json
["error", {
  "conjunctions": ["if", "when", "while", "after", "before"],
  "ignoreTestPatterns": [".*\\.e2e\\.ts$"]
}]
```

| Option               | Type       | Default                                                    | Description                                 |
|----------------------|------------|------------------------------------------------------------|---------------------------------------------|
| `conjunctions`       | `string[]` | `["if", "when", "while", "after", "before", "with", ...]` | Valid conjunctions list                     |
| `ignoreTestPatterns` | `string[]` | `[]`                                                       | File patterns (regex) to exclude from check |

---

### `util-hook-single-export`

Enforces Single Responsibility for `utils/` and `hooks/` directories by ensuring that each file exports at most one function or custom hook. It prevents collector files (`*Utils.ts`, `helpers.ts`), forbids default exports (configurable), and checks filename matching.

```ts
// ✅ Valid: /src/utils/date/formatDate.ts
export const formatDate = (date: Date): string => { ... };

// ✅ Valid: /src/utils/calculateBalance.ts (Unexported internal helpers are allowed)
const getData = () => { ... };
export const calculateBalance = () => { ... };

// ❌ Invalid: Multiple exported functions in one file
export const formatDate = (date: Date) => { ... };
export const getDayDiff = (a: Date, b: Date) => { ... };

// ❌ Invalid: Collector file name
// File: src/utils/dateUtils.ts
export const formatDate = (date: Date) => { ... };

// ❌ Invalid: Default exports forbidden by default
export default function calculateBalance() { ... }
```

**Options:**

```json
["error", {
  "maxExports": 1,
  "allowDefaultExport": false,
  "allowTypeExports": true,
  "enforceFileNameMatch": true
}]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `maxExports` | `number` | `1` | Max exported value symbols allowed per file |
| `allowDefaultExport` | `boolean` | `false` | Forbid default exports in util/hook files |
| `allowTypeExports` | `boolean` | `true` | Allow type/interface exports alongside the function |
| `enforceFileNameMatch` | `boolean` | `true` | Enforce that export name matches file name |

---

### `util-hook-colocation`

Enforces Colocation boundaries for local utils and hooks in component directories. Ensures private helpers in `components/X/utils/*` or `components/X/hooks/*` are not imported outside `components/X/`.

```ts
// ✅ Valid: /src/components/AccountDetail/index.tsx
import { formatAccountNumber } from './utils/formatAccountNumber';

// ✅ Valid: /src/components/AccountDetail/TransactionList/index.tsx (child component)
import { formatAccountNumber } from '../utils/formatAccountNumber';

// ❌ Invalid: /src/components/TransactionList/index.tsx (sibling component importing private util)
import { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';

// ❌ Invalid: /src/pages/Dashboard/index.tsx (page importing private component hook)
import { useAccountDetail } from '../../components/AccountDetail/hooks/useAccountDetail';
```

**Options:**

```json
["error", {
  "componentDirs": ["components", "pages", "views", "modules", "app", "features"],
  "utilFolderNames": ["utils", "hooks"]
}]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `componentDirs` | `string[]` | `["components", "pages", ...]` | Folder names considered component root containers |
| `utilFolderNames` | `string[]` | `["utils", "hooks"]` | Subfolder names considered local helper directories |

---

### `react-component-props-naming-check`

Enforces that props types passed to React components follow the `{ComponentName}Props` naming convention.

- Applies to PascalCase functions that return JSX (`returnsJSX` check).
- Supports standard functions, arrow functions, `React.memo`, and `React.forwardRef`.
- Supports `PropsWithChildren<{ComponentName}Props>` wrappers and intersections (`{ComponentName}Props & React.HTMLAttributes<T>`).
- Ignores components without props, untyped props, inline object types (`{ text: string }`), hook functions (`use*`), render helpers (`render*`), non-JSX functions, test files, and `apis/` files.

```tsx
// ✅ Valid
interface LoginProps { username: string }
function Login(props: LoginProps) { return <form>{props.username}</form>; }

interface CardProps { title: string }
const Card = (props: PropsWithChildren<CardProps>) => <div>{props.children}</div>;

const Header = () => <header>Site Header</header>;

// ❌ Invalid
interface LoginData { username: string }
function Login(props: LoginData) { return <form>{props.username}</form>; } // should be LoginProps

interface ButtonSettings { label: string }
const ActionButton = (props: ButtonSettings) => <button>{props.label}</button>; // should be ActionButtonProps
```

---

### `react-export-single-component-check`

Enforces that each React component file (`.tsx`) exports at most one React component. Exporting multiple components from the same file violates Single Responsibility and hinders component organization.

- Checks `export function`, `export const` (arrow function, `React.memo`, `React.forwardRef`, `React.lazy`), and local `export { LocalComp }`.
- Automatically ignores barrel files (`index.tsx`), app entry points (`main.tsx`, `App.tsx`), test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`), storybook files (`*.stories.tsx`), and non-TSX files (`.ts`, `.js`).
- Allows single component with helper `camelCase` functions, custom hooks (`use*`), types/interfaces, enums, and constants.
- Supports the Compound Component pattern where subcomponents are attached to the parent without being separately exported (`Accordion.Item = AccordionItem`).

```tsx
// ✅ Valid
export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}

// ✅ Valid (compound component pattern)
export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}
function AccordionItem({ label }: ItemProps) {
  return <li>{label}</li>;
}
Accordion.Item = AccordionItem;

// ❌ Invalid — multiple function components exported
export function PrimaryButton({ label }: { label: string }) {
  return <button className="primary">{label}</button>;
}
export function SecondaryButton({ label }: { label: string }) {
  return <button className="secondary">{label}</button>;
}

// ❌ Invalid — arrow function exported as second component
export function Card() { return <div className="card" />; }
export const CardFooter = () => <footer />;
```

> This rule accepts no configuration options.

---

### `no-upstream-imports`

**Category:** 🏗️ `Architecture`

Prevents shared foundational layers (`src/utils`, `src/hooks`, `src/types`, `src/services`, `src/apis`) from importing from higher-level UI layers (`src/components`, `src/pages`, `src/views`, `src/app`).

```ts
// ❌ Invalid — shared util importing UI component
import { UserCard } from '@/components/UserCard';

// ❌ Invalid — shared hook importing Page
import { Dashboard } from '@/pages/Dashboard';

// ✅ Valid — UI component importing shared util
import { formatDate } from '@/utils/formatDate';

// ✅ Valid — shared hook importing shared util
import { formatDate } from '@/utils/formatDate';
```

**Options:**

```json
[
  "error",
  {
    "sharedLayers": ["utils", "hooks", "types", "constants", "services", "apis", "helpers"],
    "uiLayers": ["components", "pages", "views", "app", "features", "widgets"],
    "allowTypeImports": false
  }
]
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sharedLayers` | `string[]` | `['utils', 'hooks', 'types', 'constants', 'services', 'apis', 'helpers']` | Folder names considered foundational shared layers. |
| `uiLayers` | `string[]` | `['components', 'pages', 'views', 'app', 'features', 'widgets']` | Folder names considered higher UI layers. |
| `allowTypeImports` | `boolean` | `false` | When true, permits `import type` statements from UI layers. |

---

### `no-deep-relative-imports`

**Category:** 💎 `Quality`

Disallows deep relative directory traversals (`../../../`) exceeding a maximum allowed depth and enforces path aliases (`@/`) instead.

```ts
// ❌ Invalid — 3 levels up with default maxDepth 2
import { formatDate } from '../../../utils/formatDate';

// ❌ Invalid — 4 levels up
import { useUser } from '../../../../hooks/useUser';

// ✅ Valid — within maxDepth (<= 2)
import { format } from '../../utils/format';

// ✅ Valid — path alias
import { formatDate } from '@/utils/formatDate';
```

**Options:**

```json
[
  "warn",
  {
    "maxDepth": 2,
    "suggestedAlias": "@/"
  }
]
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxDepth` | `number` | `2` | Maximum allowed `..` levels in relative imports. |
| `suggestedAlias` | `string` | `"@/"` | Path alias prefix recommended in error messages. |

---

## Development

### Requirements

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm test -- --watch
```

### Project Structure

```
eslint-eg-rules/
├── src/
│   ├── index.ts                     # Plugin entry point; exports rules and configs
│   ├── rules/
│   │   ├── api-type-suffix/
│   │   │   ├── index.ts             # Rule implementation
│   │   │   └── index.test.ts        # Tests
│   │   ├── boolean-prop-naming/
│   │   ├── component-callback-naming/
│   │   ├── functions-naming/
│   │   ├── jsx-event-handler-naming/
│   │   ├── no-test-attrs/
│   │   ├── react-component-layout/
│   │   └── test-statement-match/
│   └── utils/
│       └── react-events.ts          # Shared event map definitions
├── demo/                            # Vite + React 18 + TypeScript demo project
├── dist/                            # Build output (not committed)
├── package.json
└── tsconfig.json
```

---

## Demo Project

The `demo/` directory is a Vite + React 18 + TypeScript project configured to use only this plugin.

```bash
# Build the plugin first (from root)
npm run build

# Install demo dependencies
cd demo && npm install

# Run demo dev server
npm run dev

# Run lint check in demo
npm run lint
```

> The demo project's ESLint config is independent from the root project's config.

---

## Adding a New Rule

1. Create a new folder under `src/rules/`:
   ```
   src/rules/my-new-rule/
   ├── index.ts       # Rule implementation
   └── index.test.ts  # Tests
   ```

2. Implement the rule using `@typescript-eslint/utils`:
   ```ts
   import { TSESLint } from '@typescript-eslint/utils';

   const rule: TSESLint.RuleModule<'myMessage', []> = {
     meta: {
       type: 'suggestion',
       docs: { description: 'Rule description' },
       messages: { myMessage: 'Error message' },
       schema: [],
     },
     defaultOptions: [],
     create(context) {
       return {
         Identifier(node) {
           // ...
         },
       };
     },
   };

   export default rule;
   ```

3. Register it in `src/index.ts`:
   ```ts
   import myNewRule from './rules/my-new-rule';

   export const rules = {
     // ...existing rules
     'my-new-rule': myNewRule,
   };

   export const configs = {
     recommended: {
       rules: {
         // ...
         'strict-eg-rulez/my-new-rule': 'error',
       },
     },
   };
   ```

4. Build and test:
   ```bash
   npm run build
   cd demo && npm run lint
   ```
