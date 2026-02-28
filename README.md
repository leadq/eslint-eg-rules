# eslint-plugin-eg-rules

A collection of custom ESLint rules for React + TypeScript projects. Designed to enforce consistency, readability, and maintainability across frontend codebases.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Rules](#rules)
  - [api-type-suffix](#api-type-suffix)
  - [boolean-prop-naming](#boolean-prop-naming)
  - [component-callback-naming](#component-callback-naming)
  - [functions-naming](#functions-naming)
  - [jsx-event-handler-naming](#jsx-event-handler-naming)
  - [react-component-layout](#react-component-layout)
  - [test-statement-match](#test-statement-match)
- [Development](#development)
- [Demo Project](#demo-project)
- [Adding a New Rule](#adding-a-new-rule)

---

## Installation

```bash
npm install eslint-plugin-eg-rules --save-dev
```

> **Peer dependency:** ESLint `>=8.0.0` is required.

---

## Usage

`eslint.config.mjs` (ESLint Flat Config):

```js
import egRules from 'eslint-plugin-eg-rules';

export default [
  {
    plugins: {
      'eg-rules': egRules,
    },
    rules: {
      ...egRules.configs.recommended.rules,
    },
  },
];
```

Or configure rules individually:

```js
import egRules from 'eslint-plugin-eg-rules';

export default [
  {
    plugins: { 'eg-rules': egRules },
    rules: {
      'eg-rules/api-type-suffix': 'error',
      'eg-rules/boolean-prop-naming': 'warn',
      // ...
    },
  },
];
```

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
         'eg-rules/my-new-rule': 'error',
       },
     },
   };
   ```

4. Build and test:
   ```bash
   npm run build
   cd demo && npm run lint
   ```
