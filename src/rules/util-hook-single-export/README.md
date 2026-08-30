# util-hook-single-export

Enforces Single Responsibility for `utils/` and `hooks/` directories by ensuring that each file exports at most one main function or custom hook. It also prevents collector files (e.g., `dateUtils.ts`, `helpers.ts`), forbids default exports (configurable), and verifies that the exported symbol name matches the file name.

## Rule Details

Under the Single Responsibility principle:
- A util or custom hook file should perform one dedicated task.
- Monolithic files containing multiple unrelated exports make unit tests bloated, dependencies harder to trace, and prevent efficient dead code elimination.
- Private helper functions (unexported) are completely allowed inside the same file.
- Type/Interface exports are allowed alongside the main function by default.

### Examples of **incorrect** code for this rule:

```ts
// ❌ /src/utils/date/formatDate.ts - Multiple exported functions
export const formatDate = (date: Date) => { ... };
export const getDayDiff = (a: Date, b: Date) => { ... };
export const isWeekend = (date: Date) => { ... };

// ❌ /src/hooks/useUser.ts - Multiple custom hooks in one file
export function useUser() { ... }
export function useUserPreferences() { ... }

// ❌ /src/utils/dateUtils.ts - Collector filename
export const formatDate = (date: Date) => { ... };

// ❌ /src/utils/helpers.ts - Collector filename
export const helper = () => { ... };

// ❌ /src/utils/calculateBalance.ts - Default exports forbidden by default
export default function calculateBalance() { ... }

// ❌ /src/utils/date/formatDate.ts - Export name mismatch
export const getFormattedDate = (date: Date) => { ... };
```

### Examples of **correct** code for this rule:

```ts
// ✅ /src/utils/date/formatDate.ts - Single focused function
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

// ✅ /src/hooks/useDebounce.ts - Single custom hook
export const useDebounce = <T>(value: T, delay: number): T => {
  return value;
};

// ✅ /src/utils/calculateBalance.ts - Private unexported helper functions are allowed
const getData = () => { ... };
const formatData = (data: any) => { ... };

export const calculateBalance = () => {
  const current = getData();
  return formatData(current);
};

// ✅ /src/utils/date/formatDate.ts - Types/interfaces for the util are allowed
export interface FormatDateOptions {
  locale?: string;
}

export const formatDate = (date: Date, options?: FormatDateOptions): string => { ... };
```

## Options

```json
{
  "strict-eg-rulez/util-hook-single-export": [
    "error",
    {
      "maxExports": 1,
      "allowDefaultExport": false,
      "allowTypeExports": true,
      "enforceFileNameMatch": true
    }
  ]
}
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxExports` | `number` | `1` | Maximum number of exported value symbols (functions/hooks/constants/classes) allowed per file. |
| `allowDefaultExport` | `boolean` | `false` | When `false`, `export default` is reported as an error. |
| `allowTypeExports` | `boolean` | `true` | When `true`, TypeScript `type` and `interface` exports are not counted toward the export limit. |
| `enforceFileNameMatch` | `boolean` | `true` | When `true`, verifies that the single exported symbol name matches the file name (e.g. `formatDate.ts` -> `formatDate`). |
| `bannedFileNamePatterns` | `string[]` | `["*Utils.ts", "*Helper.ts", "*Helpers.ts", "*Hooks.ts", "helpers.ts", "utils.ts"]` | File names that are prohibited as monolithic/collector files. |
| `includePaths` | `string[]` | `["**/utils/**", "**/hooks/**"]` | Glob patterns for paths checked by this rule. |
| `ignoreFiles` | `string[]` | `["index.ts", "index.tsx", "**/*.test.ts", "**/*.spec.ts", "**/__tests__/**"]` | Glob patterns for files ignored by this rule. |
