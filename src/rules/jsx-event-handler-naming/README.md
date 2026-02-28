# jsx-event-handler-naming

Enforce that functions defined locally within a React component and passed as event handlers in JSX start with a `handle` prefix.

## Rule Details

When functions are defined within a React component's scope and used as an event callback inside JSX (e.g., `onClick`, `onChange`), they should start with the `handle` prefix to ensure consistent naming conventions.

Functions passed from component props or imported from other files are implicitly ignored, providing a flexible developer experience.

### Options

The rule accepts an options object:

* `strict` (boolean): Default is `true`. When enabled, the handler function name must end with the exact base event name from the JSX prop (e.g., `onListChange` requires the handler to end with `ListChange`, such as `handleListChange`).

### 👎 Examples of **incorrect** code for this rule:

```tsx
function MyComponent() {
  const updateList = () => {};
  // 1. Missing 'handle' prefix
  return <div onClick={updateList} />;
}
```

```tsx
// With { strict: true } (the default)
function MyComponent() {
  const handleChange = () => {};
  // 2. Strict mismatch: Handler ends with "Change", but prop expects "ListChange".
  return <div onListChange={handleChange} />;
}
```

### 👍 Examples of **correct** code for this rule:

```tsx
function MyComponent() {
  const handleClick = () => {};
  // 1. Correct 'handle' prefix for standard events.
  return <div onClick={handleClick} />;
}
```

```tsx
function MyComponent({ onClick }) {
  // 2. Passed directly from props - ignored by the rule
  return <div onClick={onClick} />;
}
```

```tsx
import { mySharedFunction } from './utils';

function MyComponent() {
  // 3. Imported functions are also ignored by the rule
  return <div onClick={mySharedFunction} />;
}
```

```tsx
// With { strict: false }
function MyComponent() {
  const handleUpdate = () => {};
  // 4. Starts with handle, strict ending check is bypassed.
  return <div onChange={handleUpdate} />;
}
```
