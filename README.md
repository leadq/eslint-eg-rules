# eslint-plugin-strict-eg-rulez

[![npm version](https://img.shields.io/npm/v/eslint-plugin-strict-eg-rulez.svg)](https://www.npmjs.com/package/eslint-plugin-strict-eg-rulez)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![ESLint v8/v9 Support](https://img.shields.io/badge/ESLint-v8%20%7C%20v9%20Flat%20Config-4B32C3.svg)](https://eslint.org/)

An enterprise-grade, highly-configurable ESLint plugin for modern **React + TypeScript** codebases. Designed to strictly enforce clean architecture, domain-driven colocation, single responsibility, predictable naming conventions, and layout hygiene.

---

## 📑 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
  - [ESLint v9+ (Flat Config)](#eslint-v9-flat-config---eslintconfigmjs)
  - [ESLint v8 (Legacy Config)](#eslint-v8-legacy-config---eslintrcjs)
- [Rule Taxonomy & Category Presets](#-rule-taxonomy--category-presets)
- [📖 Rules Catalog](#-rules-catalog)
  - [🏷️ Naming Rules](#️-naming-rules)
    - [`api-type-suffix`](#1-strict-eg-rulezapi-type-suffix)
    - [`boolean-prop-naming`](#2-strict-eg-rulezboolean-prop-naming)
    - [`component-callback-naming`](#3-strict-eg-rulezcomponent-callback-naming)
    - [`functions-naming`](#4-strict-eg-rulezfunctions-naming)
    - [`jsx-event-handler-naming`](#5-strict-eg-rulezjsx-event-handler-naming)
    - [`react-bem-naming`](#6-strict-eg-rulezreact-bem-naming)
    - [`react-component-props-naming-check`](#7-strict-eg-rulezreact-component-props-naming-check)
  - [🏗️ Architecture Rules](#️-architecture-rules)
    - [`util-hook-colocation`](#8-strict-eg-rulezutil-hook-colocation)
    - [`react-component-layout`](#9-strict-eg-rulezreact-component-layout)
    - [`no-upstream-imports`](#10-strict-eg-rulezno-upstream-imports)
  - [💎 Quality Rules](#-quality-rules)
    - [`util-hook-single-export`](#11-strict-eg-rulezutil-hook-single-export)
    - [`no-deep-relative-imports`](#12-strict-eg-rulezno-deep-relative-imports)
  - [⚛️ React Rules](#️-react-rules)
    - [`react-export-single-component-check`](#13-strict-eg-rulezreact-export-single-component-check)
    - [`no-unused-deps-in-hooks`](#14-strict-eg-rulezno-unused-deps-in-hooks)
  - [🧪 Testing Rules](#-testing-rules)
    - [`test-statement-match`](#15-strict-eg-ruleztest-statement-match)
    - [`no-test-attrs`](#16-strict-eg-rulezno-test-attrs)
- [Development & Contributing](#-development--contributing)
- [License](#-license)

---

## 🚀 Features

- **Full ESLint v8 & v9 Support**: Out-of-the-box compatibility with both legacy `.eslintrc` and Flat Config (`eslint.config.js` / `eslint.config.mjs`).
- **Deep AST & Type-Aware Intelligence**: Built on `@typescript-eslint/utils` with support for TypeScript Generics, `type` vs `value` spaces, Type Assertions (`as const`, `satisfies`), and Wrapper HOCs (`memo`, `forwardRef`, `lazy`).
- **100% Configurable**: All rules provide complete JSON schemas with fine-grained customization (custom prefixes, file ignore patterns, suffixes, compound components, etc.).
- **Auto-Fixing Capabilities**: Rules like `react-component-layout` and `no-unused-deps-in-hooks` feature automated AST code fixes.

---

## 📦 Installation

```bash
npm install eslint-plugin-strict-eg-rulez --save-dev
# or
yarn add -D eslint-plugin-strict-eg-rulez
# or
pnpm add -D eslint-plugin-strict-eg-rulez
```

> **Peer Dependency:** Requires `eslint >= 8.0.0` and `@typescript-eslint/parser >= 8.0.0`.

---

## ⚡ Quick Start

### ESLint v9 (Flat Config - `eslint.config.mjs`)

```js
import strictEgRulez from 'eslint-plugin-strict-eg-rulez';

export default [
  // Option A: Enable the entire recommended preset (All 16 rules)
  strictEgRulez.configs['flat/recommended'],

  // Option B: Enable selective category presets
  // strictEgRulez.configs['flat/architecture'],
  // strictEgRulez.configs['flat/quality'],
  // strictEgRulez.configs['flat/naming'],
  // strictEgRulez.configs['flat/react'],
  // strictEgRulez.configs['flat/testing'],

  // Option C: Manual rule configuration
  {
    plugins: {
      'strict-eg-rulez': strictEgRulez,
    },
    rules: {
      'strict-eg-rulez/util-hook-single-export': ['error', { allowConstants: true }],
      'strict-eg-rulez/react-export-single-component-check': ['error', { compound: true }],
    },
  },
];
```

### ESLint v8 (Legacy Config - `.eslintrc.js`)

```js
module.exports = {
  plugins: ['strict-eg-rulez'],
  extends: [
    'plugin:strict-eg-rulez/recommended',
    // or specific category: 'plugin:strict-eg-rulez/architecture'
  ],
};
```

---

## 🗂️ Rule Taxonomy & Category Presets

All rules in this plugin are strictly organized into 6 official categories:

| Category | Description | Included Rules |
| :--- | :--- | :--- |
| 🏷️ **`naming`** | Semantic naming conventions for functions, variables, props, types, and handlers | `api-type-suffix`, `boolean-prop-naming`, `component-callback-naming`, `functions-naming`, `jsx-event-handler-naming`, `react-bem-naming`, `react-component-props-naming-check` |
| 🏗️ **`architecture`** | Dependency directions, layer boundaries, and helper colocation | `util-hook-colocation`, `react-component-layout`, `no-upstream-imports` |
| 💎 **`quality`** | Single Responsibility (SRP), clean code practices, import hygiene | `util-hook-single-export`, `no-deep-relative-imports` |
| ⚛️ **`react`** | React lifecycle, hooks correctness, single component exports | `react-export-single-component-check`, `no-unused-deps-in-hooks` |
| 🧪 **`testing`** | Test statement phrasing, test description standards, test attribute isolation | `test-statement-match`, `no-test-attrs` |
| 📁 **`structure`** | Physical file and folder anatomy | *(Ready for structure extensions)* |

---

## 📖 Rules Catalog

---

### 🏷️ Naming Rules

#### 1. `strict-eg-rulez/api-type-suffix`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces that all TypeScript `type` and `interface` declarations defined in API directories (`src/apis/`, `src/api/`, `src/services/`) strictly end with an allowed semantic suffix (e.g., `Model`, `Response`, `Request`). Also prevents repetitive or consecutive suffixes (e.g. `UserRequestModel` ❌).

##### ⚙️ Options
```ts
interface ApiTypeSuffixOptions {
  suffixes?: string[];          // Allowed suffixes (Default: ['Model', 'Response', 'Request'])
  apiFolderPatterns?: string[]; // Folders treated as API directories (Default: ['src/apis', 'src/api'])
  ignorePatterns?: string[];    // Glob patterns to ignore (Default: ['**/*.test.*', '**/*.spec.*'])
}
```

##### ❌ Incorrect
```ts
// File: src/apis/user.ts
export interface User { id: string; }             // Missing suffix
export type UserRequestModel = { token: string; }; // Consecutive suffixes
```

##### ✅ Correct
```ts
// File: src/apis/user.ts
export interface UserModel { id: string; }
export type UserRequest = { token: string; };
export interface UserResponse { success: boolean; data: UserModel; }
```

---

#### 2. `strict-eg-rulez/boolean-prop-naming`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces standard boolean prefixes (`is`, `are`, `has`, `have`, `can`, `should`, `will`, `did`, `do`, `does`) for boolean properties and parameters in components, hooks, and utilities (including plural forms like `areColumnsDraggable`, `haveAccess`). Prevents ambiguous identifiers like `valid` or `open`. Standard HTML boolean attributes (`disabled`, `required`, `checked`, `readOnly`, `open`, etc.) are automatically exempt.

##### ⚙️ Options
```ts
interface BooleanPropNamingOptions {
  allowedPrefixes?: string[]; // List of allowed prefixes (Default: ['is', 'are', 'has', 'have', 'can', 'should', 'will', 'did', 'do', 'does'])
  ignoreProps?: string[];     // Prop names exempt from checks (Default: HTML boolean attrs)
  ignorePatterns?: string[];  // Glob patterns to ignore (Default: ['**/*.test.*', '**/*.spec.*'])
}
```

##### ❌ Incorrect
```ts
interface ModalProps {
  visible: boolean; // ❌ Should be isVisible
  error: boolean;   // ❌ Should be hasError
  columnsDraggable: boolean; // ❌ Should be areColumnsDraggable
}
function useToggle(active: boolean = false) {} // ❌ Should be isActive
```

##### ✅ Correct
```ts
interface ModalProps {
  isVisible: boolean;
  hasError: boolean;
  areColumnsDraggable: boolean; // ✅ Allowed plural boolean prefix
  disabled: boolean; // ✅ Allowed (Standard HTML attribute)
}
function useToggle(isActive: boolean = false) {}
```

---

#### 3. `strict-eg-rulez/component-callback-naming`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces that callback function props in React component prop types start with the `on` prefix (e.g. `onChange`, `onSubmit`). Prevents passive or past-tense callback names (e.g., `onClicked` ❌ vs `onClick` ✅).

##### ⚙️ Options
```ts
interface ComponentCallbackNamingOptions {
  allowPastTense?: boolean; // If true, permits past tense like onClicked (Default: false)
  blacklist?: string[];     // Disallowed suffixes (Default: ['Clicked', 'Changed', 'Loaded'])
  whitelist?: string[];     // Explicitly allowed names bypassing checks (Default: [])
}
```

##### ❌ Incorrect
```ts
interface ButtonProps {
  click: () => void;     // ❌ Missing 'on' prefix
  onClicked: () => void; // ❌ Past-tense verb
}
```

##### ✅ Correct
```ts
interface ButtonProps {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
  onFilterChange: (filter: string) => void;
}
```

---

#### 4. `strict-eg-rulez/functions-naming`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces intent-revealing function names based on return value analysis:
- **Returns JSX/ReactNode**: Must start with `render` (e.g., `renderHeader`). React components (PascalCase) are exempt.
- **Returns Boolean**: Must start with `is`, `has`, `can`, `will`, `should`, `did` (e.g., `isAuthorized`).
- **Returns Object/Array/Primitive/Value**: Must start with `calculate`, `get`, `determine`, `format`, `build`, etc. (e.g., `calculateTotal`, `getUserProfile`).

##### ⚙️ Options
```ts
interface FunctionsNamingOptions {
  booleanPrefixes?: string[]; // Default: ['is', 'has', 'will', 'can', 'should', 'did']
  valuePrefixes?: string[];   // Default: ['calculate', 'get', 'determine']
  jsxPrefixes?: string[];     // Default: ['render']
  ignoreNames?: string[];     // Function names to ignore
  ignorePatterns?: string[];  // Glob patterns to ignore
}
```

##### ❌ Incorrect
```ts
const userCard = () => <Card />;        // ❌ Missing 'render' prefix
const ready = (): boolean => true;      // ❌ Missing boolean prefix
const total = (): number => a + b;      // ❌ Missing 'calculate' / 'get'
```

##### ✅ Correct
```ts
const renderUserCard = () => <Card />;
const isReady = (): boolean => true;
const calculateTotal = (): number => a + b;
const getUserName = (): string => user.name;
```

---

#### 5. `strict-eg-rulez/jsx-event-handler-naming`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces that local event handler functions bound to JSX event attributes start with `handle` and (in `strict` mode) end with the event name.

##### ⚙️ Options
```ts
interface JSXEventHandlerNamingOptions {
  strict?: boolean;          // Requires matching event suffix (e.g., handleClick for onClick) (Default: true)
  prefix?: string;           // Required handler prefix (Default: 'handle')
  ignoreProps?: string[];    // Props to ignore
  ignorePatterns?: string[]; // Glob patterns to ignore
}
```

##### ❌ Incorrect
```tsx
const clickAction = () => {};
const doSubmit = () => {};

<button onClick={clickAction} />  // ❌ Missing 'handle' prefix
<form onSubmit={doSubmit} />      // ❌ Missing 'handle' prefix
```

##### ✅ Correct
```tsx
const handleClick = () => {};
const handleFormSubmit = () => {};

<button onClick={handleClick} />
<form onSubmit={handleFormSubmit} />
```

---

#### 6. `strict-eg-rulez/react-bem-naming`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces strict BEM (Block Element Modifier) CSS class naming conventions inside React components, validating class names from CSS Modules or string literals.

##### ⚙️ Options
```ts
interface ReactBemNamingOptions {
  mode?: 'kebab-case' | 'camelCase' | 'strict'; // Default: 'kebab-case'
}
```

##### ❌ Incorrect
```tsx
// Mode: 'strict' in component UserCard
<div className={styles.user_card__header___title} /> // ❌ Invalid BEM syntax
<div className={styles.navBar__item} />              // ❌ Block does not match component name
```

##### ✅ Correct
```tsx
// Mode: 'strict' in component UserCard
<div className={styles.userCard} />
<div className={styles.userCard__header} />
<div className={styles.userCard__header__button} />
<div className={styles.userCard__header__button$active} />
```

---

#### 7. `strict-eg-rulez/react-component-props-naming-check`
> **Category:** 🏷️ `naming` | **Recommended:** `error`

Enforces that React component prop types strictly follow the `{ComponentName}Props` naming convention (e.g., `ButtonProps` for `Button`, `UserProfileProps` for `UserProfile`). Supports standard functions, arrow functions, `React.FC<T>`, `React.memo`, and `React.forwardRef`.

##### ⚙️ Options
```ts
interface ReactComponentPropsNamingOptions {
  suffix?: string;             // Expected suffix (Default: 'Props')
  allowGenericProps?: boolean; // Permits generic 'Props' or 'TProps' (Default: false)
  ignoreComponents?: string[]; // Component names to exempt
  ignorePatterns?: string[];   // Glob patterns to ignore
}
```

##### ❌ Incorrect
```tsx
interface ButtonData { label: string; }
export const Button = (props: ButtonData) => <button>{props.label}</button>; // ❌ Should be ButtonProps
```

##### ✅ Correct
```tsx
interface ButtonProps { label: string; }
export const Button = (props: ButtonProps) => <button>{props.label}</button>;

interface CardProps { title: string; }
export const Card = React.memo((props: PropsWithChildren<CardProps>) => <div>{props.children}</div>);
```

---

### 🏗️ Architecture Rules

#### 8. `strict-eg-rulez/util-hook-colocation`
> **Category:** 🏗️ `architecture` | **Recommended:** `error`

Enforces Colocation boundaries for local component helpers. Utilities and hooks defined inside a component folder (e.g., `src/components/Account/utils/*`, `src/components/Account/hooks/*`) are private to that component subtree and **cannot be imported by sibling components or parent pages**.

##### ⚙️ Options
```ts
interface UtilHookColocationOptions {
  componentDirs?: string[];   // Container directories (Default: ['components', 'pages', 'views', 'modules', 'app', 'features', 'widgets'])
  utilFolderNames?: string[]; // Helper folder names (Default: ['utils', 'hooks', 'helpers'])
  ignorePatterns?: string[];  // Glob patterns to ignore
}
```

##### ❌ Incorrect
```ts
// File: src/components/Dashboard/index.tsx (Sibling component)
// ❌ Violates colocation boundary: importing private helper from AccountDetail
import { formatAccount } from '../AccountDetail/utils/formatAccount';
```

##### ✅ Correct
```ts
// File: src/components/AccountDetail/SubSection/index.tsx (Child component)
// ✅ Allowed: Sub-tree descendant of AccountDetail
import { formatAccount } from '../utils/formatAccount';

// File: src/components/Dashboard/index.tsx
// ✅ Allowed: Shared global utility
import { formatAccount } from '@/utils/formatAccount';
```

---

#### 9. `strict-eg-rulez/react-component-layout`
> **Category:** 🏗️ `architecture` | **Recommended:** `error` | 🔧 **Auto-fixable**

Enforces a chronological declaration layout inside React Components based on Separation of Concerns (SoC) and MVVM architecture. Ensures hooks, state, handlers, and view variables are cleanly organized.

**Chronological Layout Sequence:**
1. **Priority Navigation/I18n Hooks** (`useLocation`, `useNavigate`, `useTranslation`)
2. **Context Hooks** (`useAuthContext`, `useThemeContext`)
3. **State Hooks** (`useState`, `useReducer`, `watch`)
4. **Query & Mutation Hooks** (`useQuery`, `useMutation`)
5. **Custom Hooks** (`useDebounce`, `useForm`)
6. **Side-Effect & Memoization Hooks** (`useEffect`, `useMemo`, `useCallback`)
7. **Utility Functions** (`const calculateSummary = () => ...`)
8. **Event / Action Handlers** (`const handleSubmit = () => ...`)
9. **View Values & Derived State** (`const isSubmitDisabled = ...`)
10. **Early Returns / Guards** (`if (isLoading) return <Spinner />;`)
11. **JSX Render Return** (`return <Layout>...</Layout>;`)

##### ⚙️ Options
```ts
interface ReactComponentLayoutOptions {
  allowUnorderedHooks?: boolean; // If true, allows all hooks to be ordered freely among themselves (Default: false)
  ignorePatterns?: string[];      // Glob patterns to ignore
}
```

##### ❌ Incorrect
```tsx
export function Profile() {
  const [name, setName] = useState('');
  
  // ❌ Side-effect declared before state/query hooks
  useEffect(() => { load(); }, []);

  const location = useLocation(); // ❌ Priority hook declared too late
  const { data } = useQuery();
  
  return <div>{name}</div>;
}
```

##### ✅ Correct (Auto-fixable via `eslint --fix`)
```tsx
export function Profile() {
  const location = useLocation();
  const [name, setName] = useState('');
  const { data } = useQuery();

  useEffect(() => { load(); }, []);

  const handleNameChange = (e) => setName(e.target.value);
  const isComplete = name.length > 0;

  return <div>{name}</div>;
}
```

---

#### 10. `strict-eg-rulez/no-upstream-imports`
> **Category:** 🏗️ `architecture` | **Recommended:** `error`

Enforces strict Architectural Layer Boundaries. Foundational shared layers (`utils`, `hooks`, `types`, `services`, `apis`) must **never import from higher-level UI layers** (`components`, `pages`, `views`, `app`).

##### ⚙️ Options
```ts
interface NoUpstreamImportsOptions {
  sharedLayers?: string[];     // Default: ['utils', 'hooks', 'types', 'constants', 'services', 'apis', 'helpers']
  uiLayers?: string[];         // Default: ['components', 'pages', 'views', 'app', 'features', 'widgets']
  allowTypeImports?: boolean;  // If true, permits `import type` from UI layers (Default: false)
  ignorePatterns?: string[];   // Glob patterns to ignore
}
```

##### ❌ Incorrect
```ts
// File: src/utils/formatUser.ts (Shared Layer)
// ❌ Upstream Import Violation: Shared util cannot import UI component
import { UserAvatar } from '@/components/UserAvatar';
```

##### ✅ Correct
```ts
// File: src/components/UserProfile.tsx (UI Layer)
// ✅ Allowed: UI layer imports foundational utility
import { formatUser } from '@/utils/formatUser';
```

---

### 💎 Quality Rules

#### 11. `strict-eg-rulez/util-hook-single-export`
> **Category:** 💎 `quality` | **Recommended:** `error`

Enforces Single Responsibility Principle (SRP) for utility and hook files. Prevents messy collector files (`utils.ts`, `helpers.ts`) by requiring that each file exports **at most one primary function or custom hook**.
- Filename must match the exported function name (`formatDate.ts` -> `export function formatDate`).
- Non-callable constants (`export const DEFAULT_LOCALE = 'en';`) and TypeScript types (`export type DateFormat = ...`) are permitted alongside the primary function.

##### ⚙️ Options
```ts
interface UtilHookSingleExportOptions {
  maxExports?: number;            // Max exported functions allowed per file (Default: 1)
  allowDefaultExport?: boolean;   // Forbid default exports in util files (Default: false)
  allowTypeExports?: boolean;     // Permit exporting types/interfaces (Default: true)
  allowConstants?: boolean;       // Permit exporting constants/configs (Default: true)
  enforceFileNameMatch?: boolean; // Require function name to match file name (Default: true)
  ignoreFiles?: string[];         // Glob patterns to ignore
}
```

##### ❌ Incorrect
```ts
// File: src/utils/dateUtils.ts
// ❌ Multiple functions exported in one file + collector file name
export const formatDate = (d: Date) => d.toISOString();
export const parseDate = (s: string) => new Date(s);
export const getDayDiff = (a: Date, b: Date) => 0;
```

##### ✅ Correct
```ts
// File: src/utils/date/formatDate.ts
export type DateFormat = 'short' | 'long';
export const DEFAULT_FORMAT = 'YYYY-MM-DD';

// ✅ Exactly 1 exported callable function matching filename
export function formatDate(d: Date, format: DateFormat = 'short'): string {
  return d.toISOString();
}
```

---

#### 12. `strict-eg-rulez/no-deep-relative-imports`
> **Category:** 💎 `quality` | **Recommended:** `warn`

Disallows deep relative imports (`../../../../`) that exceed a configured threshold. Enforces clean Path Aliases (e.g., `@/`) for better refactorability.

##### ⚙️ Options
```ts
interface NoDeepRelativeImportsOptions {
  maxDepth?: number;         // Max allowed parent levels (Default: 2)
  suggestedAlias?: string;   // Recommended alias in error message (Default: '@/')
  ignorePatterns?: string[]; // Glob patterns to ignore
}
```

##### ❌ Incorrect
```ts
// ❌ Exceeds maxDepth (traverses 4 levels up)
import { useAuth } from '../../../../hooks/useAuth';
```

##### ✅ Correct
```ts
// ✅ Uses path alias
import { useAuth } from '@/hooks/useAuth';

// ✅ Relative import within allowed depth (<= 2)
import { SubComponent } from './SubComponent';
import { helper } from '../utils/helper';
```

---

### ⚛️ React Rules

#### 13. `strict-eg-rulez/react-export-single-component-check`
> **Category:** ⚛️ `react` | **Recommended:** `error`

Enforces that each React component file (`.tsx`) exports **at most one React component**. Multi-component files create hidden coupling and hinder tree-shaking.
- Supports `compound: true` option to allow Compound Sub-Components (e.g. `CardHeader`, `CardBody` in `Card.tsx`).
- Automatically ignores barrel files (`index.tsx`), application roots (`main.tsx`, `App.tsx`), stories (`*.stories.tsx`), and tests (`*.test.tsx`).

##### ⚙️ Options
```ts
interface ReactExportSingleComponentOptions {
  compound?: boolean;        // Allow compound components starting with main component name (Default: false)
  ignorePatterns?: string[]; // Glob patterns to ignore
}
```

##### ❌ Incorrect
```tsx
// File: src/components/Buttons.tsx
// ❌ Multiple unrelated components exported from a single file
export function PrimaryButton() { return <button className="primary" />; }
export function SecondaryButton() { return <button className="secondary" />; }
```

##### ✅ Correct
```tsx
// File: src/components/Button.tsx
export function Button({ variant }: ButtonProps) {
  return <button className={variant} />;
}

// File: src/components/Card.tsx (with compound: true)
export function Card({ children }: CardProps) { return <div className="card">{children}</div>; }
export function CardHeader({ title }: CardHeaderProps) { return <h3>{title}</h3>; }
export function CardBody({ children }: CardBodyProps) { return <div>{children}</div>; }
```

---

#### 14. `strict-eg-rulez/no-unused-deps-in-hooks`
> **Category:** ⚛️ `react` | **Recommended:** `error` | 🔧 **Auto-fixable**

Detects over-specified dependency arrays in React hooks (`useEffect`, `useMemo`, `useCallback`, `useLayoutEffect`). If a dependency is declared in the array but never referenced in the hook body, it is flagged and automatically removed via `--fix`.

##### ❌ Incorrect
```tsx
useEffect(() => {
  console.log(title);
  // ❌ 'count' and 'userId' are never used inside effect body
}, [title, count, userId]);
```

##### ✅ Correct (Auto-fixable via `eslint --fix`)
```tsx
useEffect(() => {
  console.log(title);
}, [title]);
```

---

### 🧪 Testing Rules

#### 15. `strict-eg-rulez/test-statement-match`
> **Category:** 🧪 `testing` | **Recommended:** `error`

Enforces clear, BDD-style phrasing in test assertions:
- `it(...)` descriptions must begin with `"should "` (e.g., `it('should render correctly')`).
- `test(...)` descriptions must contain a condition/conjunction (`when`, `if`, `while`, `after`, `before`, `with`).

##### ⚙️ Options
```ts
interface TestStatementMatchOptions {
  conjunctions?: string[];       // Conjunction words for test() (Default: ['if', 'when', 'while', 'after', ...])
  ignoreTestPatterns?: string[]; // Regex patterns to exclude from check
}
```

##### ❌ Incorrect
```ts
it('renders the header correctly', () => {}); // ❌ Missing 'should'
test('user login flow', () => {});            // ❌ Missing condition conjunction
```

##### ✅ Correct
```ts
it('should render the header correctly', () => {});
test('should authenticate user when credentials are valid', () => {});
```

---

#### 16. `strict-eg-rulez/no-test-attrs`
> **Category:** 🧪 `testing` | **Recommended:** `error`

Disallows test-specific QA attributes (`data-testid`, `data-test`, `data-cy`, `data-e2e`) from leaking into production component source code. Test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`) are automatically allowed.

##### ⚙️ Options
```ts
interface NoTestAttrsOptions {
  attrs?: string[]; // Attributes considered test-only (Default: ['data-testid', 'data-test', 'data-test-id', 'data-cy', 'data-e2e'])
}
```

##### ❌ Incorrect
```tsx
// File: src/components/Button.tsx (Production source)
// ❌ Test attribute leaked into production JSX
<button data-testid="submit-button" type="submit">Submit</button>
```

##### ✅ Correct
```tsx
// File: src/components/Button.tsx
<button className="btn-submit" type="submit">Submit</button>

// File: src/components/Button.test.tsx (Test file)
// ✅ Allowed in test files
<button data-testid="submit-button">Submit</button>
```

---

## 🛠️ Development & Contributing

```bash
# Clone and install dependencies
git clone https://github.com/your-org/eslint-eg-rules.git
cd eslint-eg-rules
npm install

# Run unit tests (Vitest)
npm test

# Build TypeScript output
npm run build
```

---

## 📄 License

ISC © Emre Gürler
