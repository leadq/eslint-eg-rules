# no-upstream-imports

**Category:** 🏗️ `Architecture`

Enforces clean architectural layer boundaries: prevents shared foundational layers (`src/utils`, `src/hooks`, `src/types`, `src/services`, `src/apis`) from depending on higher-level UI layers (`src/components`, `src/pages`, `src/views`, `src/app`).

## Rule Details

In layered and modular frontend architectures:
- **Layer Direction**: Higher layers (UI components, pages) can import from lower shared layers (utilities, hooks, types, services).
- **Inversion Prevention**: Lower shared layers must remain pure, decoupled, and reusable. They must never import from UI components or pages.
- Importing UI components inside global utilities causes tight coupling, circular dependencies, and unexpected side effects.

### Architecture Layer Flow

```text
┌─────────────────────────────────────────┐
│     UI Layer: components, pages, app    │
└────────────────────┬────────────────────┘
                     │  ✅ Permitted (Downstream)
                     ▼
┌─────────────────────────────────────────┐
│ Shared Layer: utils, hooks, types, apis │
└─────────────────────────────────────────┘
  ❌ NEVER import upwards from Shared to UI!
```

### Examples of **incorrect** code:

```ts
// ❌ /src/utils/formatUser.ts (Shared util importing UI component)
import { UserCard } from '@/components/UserCard';

// ❌ /src/hooks/useAnalytics.ts (Shared hook importing Page)
import { Dashboard } from '@/pages/Dashboard';

// ❌ /src/types/index.ts (Shared types re-exporting from UI component)
export { ButtonProps } from '@/components/Button';
```

### Examples of **correct** code:

```ts
// ✅ /src/components/UserCard/index.tsx (UI component importing shared util)
import { formatDate } from '@/utils/formatDate';

// ✅ /src/utils/formatUser.ts (Shared util importing another shared util)
import { padZero } from './padZero';

// ✅ /src/hooks/useUser.ts (Shared hook importing shared service)
import { fetchUserProfile } from '@/services/userService';
```

## Options

```json
{
  "strict-eg-rulez/no-upstream-imports": [
    "error",
    {
      "sharedLayers": ["utils", "hooks", "types", "constants", "services", "apis", "helpers"],
      "uiLayers": ["components", "pages", "views", "app", "features", "widgets"],
      "allowTypeImports": false
    }
  ]
}
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sharedLayers` | `string[]` | `['utils', 'hooks', 'types', 'constants', 'services', 'apis', 'helpers']` | Folder names considered foundational shared layers. |
| `uiLayers` | `string[]` | `['components', 'pages', 'views', 'app', 'features', 'widgets']` | Folder names considered higher UI layers. |
| `allowTypeImports` | `boolean` | `false` | When true, permits `import type` statements from UI layers. |
