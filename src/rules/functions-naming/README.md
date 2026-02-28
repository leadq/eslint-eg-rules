# functions-naming

Enforces function naming prefixes depending on the return type of the function.

## Rule Details

The goal of this rule is to enforce a standard naming convention for functions based on what they return:

- If a function returns `JSXElement` or `JSXFragment`, it must be prefixed with `render` (e.g. `renderComponent`).
- If a function returns a `boolean` (or uses boolean operators like `===` or `!`), it must be prefixed with boolean-like verbs: `is`, `has`, `can`, or `will` (e.g. `isReady`, `hasError`).
- If a function returns a value (like an `object`, `array`, `number`, or `string`), it must be prefixed with action verbs: `get`, `calculate`, or `determine` (e.g. `getConfig`, `calculateSum`).
- Other function types (e.g. returning `void`) are ignored.

### Ignored Function Patterns
To avoid false positives, the following are ignored:
1. **React Components**: Functions starting with a capitalized letter (e.g. `MyComponent`).
2. **React Hooks**: Functions starting with `use` (e.g. `useData`).
3. **Event Handlers**: Functions starting with `on` or `handle` (e.g. `onClick`, `handleSubmit`).

## Examples

### ❌ Incorrect

```javascript
function someFunction() {
  return <div />;
}

const validFlag = () => false;

function fetchConfig() {
  return { a: 1 };
}
```

### ✅ Correct

```javascript
function renderAwesomeDiv() {
  return <div />;
}

const isValidFlag = () => false;

function getConfig() {
  return { a: 1 };
}

// React Components are ignored
function SomeFunction() {
  return <div />;
}

// Hooks are ignored
function useFlag() {
  return false;
}

// Event Handlers are ignored
function onClick() {
  return true;
}
```
