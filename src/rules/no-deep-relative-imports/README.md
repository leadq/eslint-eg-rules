# no-deep-relative-imports

**Category:** 💎 `Quality`

Disallows deep relative imports (`../../../`) that exceed a maximum allowed directory traversal depth and enforces path aliases (`@/`) instead.

## Rule Details

Excessive relative parent traversals (`../../../../`) create brittle import paths, reduce code readability, and make refactoring and file relocation painful. 

Using standardized root path aliases (`@/components/...`, `@/utils/...`) results in cleaner, more maintainable codebases.

### Examples of **incorrect** code (with default `maxDepth: 2`):

```ts
// ❌ 3 levels up
import { formatDate } from '../../../utils/formatDate';

// ❌ 4 levels up
import { useUser } from '../../../../hooks/useUser';

// ❌ Re-exporting from 3 levels up
export { Header } from '../../../components/Header';
```

### Examples of **correct** code:

```ts
// ✅ Same directory
import { Button } from './Button';

// ✅ 1 level up (sibling directory)
import { helper } from '../helper';

// ✅ 2 levels up
import { format } from '../../utils/format';

// ✅ Path alias (Recommended)
import { formatDate } from '@/utils/formatDate';
import { useUser } from '@/hooks/useUser';
```

## Options

```json
{
  "strict-eg-rulez/no-deep-relative-imports": [
    "warn",
    {
      "maxDepth": 2,
      "suggestedAlias": "@/"
    }
  ]
}
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxDepth` | `number` | `2` | Maximum allowed `..` levels in relative imports before triggering a violation. |
| `suggestedAlias` | `string` | `"@/"` | Path alias prefix recommended in error messages. |
