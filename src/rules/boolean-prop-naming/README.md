# boolean-prop-naming

This rule checks the names of boolean properties in your `.ts` and `.tsx` files inside `components`, `hooks`, and `utils` folders.

It ensures that any `boolean` typed argument, property, or optional property follows standard boolean naming prefixes. By default, standard prefixes are verified: `is`, `are`, `has`, `have`, `can`, `should`, `will`, `did`, `do`, `does`.

## Rule Details

This rule focuses on variables and struct members strictly evaluated as `boolean` types. This eliminates confusion in component props or hook arguments where names like `loading` might imply a state object, whereas `isLoading` clearly denotes a boolean flag. It also supports plural prefixes like `areColumnsDraggable` or `haveAccess` to maintain correct English grammar and prevent breaking changes.

### ❌ Incorrect

```typescript
// Inside /src/components/MyButton.tsx
interface MyButtonProps {
  active: boolean; // ❌ should be isActive
  loading?: boolean; // ❌ should be isLoading
  columnsDraggable?: boolean; // ❌ should be areColumnsDraggable
}

// Inside /src/hooks/useToggle.ts
function useToggle(ready: boolean) { ... } // ❌ should be isReady or hasLoaded

// Inside /src/utils/status.ts
type FeatureFlags = {
  enableCache: boolean; // ❌ missing boolean prefix
};
```

### ✅ Correct

```typescript
// Inside /src/components/MyButton.tsx
interface MyButtonProps {
  isActive: boolean; // ✅
  isLoading?: boolean; // ✅
  areColumnsDraggable?: boolean; // ✅ Plural boolean prefix
  haveAccess?: boolean; // ✅ Plural boolean prefix
}

// Inside /src/hooks/useToggle.ts
function useToggle(isReady: boolean) { ... } // ✅

// Inside /src/utils/status.ts
type FeatureFlags = {
  shouldEnableCache: boolean; // ✅
};
```

## Options

This rule takes one optional object argument containing `prefixes` (or `allowedPrefixes`), which overrides the default valid variable prefixes.

```json
{
  "boolean-prop-naming": ["error", {
    "allowedPrefixes": ["is", "are", "has", "have", "can", "should", "will", "did", "do", "does"]
  }]
}
```
