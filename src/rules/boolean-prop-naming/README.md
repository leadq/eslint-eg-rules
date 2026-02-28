# boolean-prop-naming

This rule checks the names of boolean properties in your `.ts` and `.tsx` files inside `components`, `hooks`, and `utils` folders.

It ensures that any `boolean` typed argument, property, or optional property follows standard boolean naming prefixes. By default, standard prefixes are verified: `is`, `has`, `can`, `should`, `will`, `did`, `show`, `hide`.

## Rule Details

This rule focuses on variables and struct members strictly evaluated as `boolean` types. This eliminates confusion in component props or hook arguments where names like `loading` might imply a state object, whereas `isLoading` clearly denotes a boolean flag.

### ❌ Incorrect

```typescript
// Inside /src/components/MyButton.tsx
interface MyButtonProps {
  active: boolean; // ❌ should be isActive
  loading?: boolean; // ❌ should be isLoading
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
}

// Inside /src/hooks/useToggle.ts
function useToggle(isReady: boolean) { ... } // ✅

// Inside /src/utils/status.ts
type FeatureFlags = {
  shouldEnableCache: boolean; // ✅
};
```

## Options

This rule takes one optional object argument containing `prefixes`, which overrides the default valid variable prefixes.

```json
{
  "boolean-prop-naming": ["error", {
    "prefixes": ["is", "has", "can", "should", "will", "did", "show", "hide"]
  }]
}
```
