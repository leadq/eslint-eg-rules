# util-hook-colocation

Enforces Colocation boundaries for local utils and hooks in component-based architectures.

## Rule Details

Under the Colocation principle:
- When a utility function or custom hook is only used by a single component, it should be placed in that component's local `utils/` or `hooks/` directory (e.g. `components/AccountDetail/utils/formatAccountNumber.ts`).
- Local utilities and custom hooks belong strictly to that component and its descendants (subcomponents).
- Sibling components or external pages cannot import private local utilities or hooks across boundaries.
- When multiple sibling components or pages need the same utility or hook, it must be promoted to the nearest common parent component directory or to the global `src/utils/` / `src/hooks/` folders.

### Architecture Example

```text
components/
  AccountDetail/
    index.tsx
    utils/
      formatAccountNumber.ts    # 🔒 Private to AccountDetail and its subcomponents
    hooks/
      useAccountDetail.ts       # 🔒 Private to AccountDetail and its subcomponents
    TransactionList/
      index.tsx                 # ✅ Subcomponent: CAN import from ../utils/formatAccountNumber

components/
  OtherComponent/
    index.tsx                 # ❌ Sibling: CANNOT import from ../AccountDetail/utils/formatAccountNumber
```

### Examples of **incorrect** code for this rule:

```ts
// ❌ /src/components/TransactionList/index.tsx (sibling component importing private util)
import { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';

// ❌ /src/pages/Dashboard/index.tsx (page importing private component hook)
import { useAccountDetail } from '../../components/AccountDetail/hooks/useAccountDetail';

// ❌ /src/components/TransactionList/index.tsx (re-exporting private util)
export { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';
```

### Examples of **correct** code for this rule:

```ts
// ✅ /src/components/AccountDetail/index.tsx (component importing its own local util)
import { formatAccountNumber } from './utils/formatAccountNumber';

// ✅ /src/components/AccountDetail/TransactionList/index.tsx (child component importing parent util)
import { formatAccountNumber } from '../utils/formatAccountNumber';

// ✅ /src/components/AccountDetail/index.tsx (importing from global shared utils)
import { formatDate } from '@/utils/date/formatDate';

// ✅ /src/pages/Dashboard/index.tsx (importing from global shared hooks)
import { useDebounce } from '@/hooks/useDebounce';
```

## Options

```json
{
  "strict-eg-rulez/util-hook-colocation": [
    "error",
    {
      "componentDirs": ["components", "pages", "views", "modules", "app", "features"],
      "utilFolderNames": ["utils", "hooks"]
    }
  ]
}
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `componentDirs` | `string[]` | `["components", "pages", "views", "modules", "app", "features"]` | Folder names considered component root containers. |
| `utilFolderNames` | `string[]` | `["utils", "hooks"]` | Subfolder names considered local helper directories. |
