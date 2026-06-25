# component-callback-naming

This rule enforces a strict naming convention for callback functions in Component Props types.
Callback function props passed to a component must always start with the `"on"` prefix. This rule supports native DOM events (like `onClick`) as well as custom community standard events (like `onRefetch`, `onDataLoad`).

This rule only checks interfaces or types that are **actually used** as the props parameter of a React Component (defined in the same file). If an interface is loosely defined but not used by a Component, it is ignored by this rule to prevent false positives globally across the project.

## Rule Details

### ❌ Incorrect

```typescript
interface ButtonProps {
  refetch: () => void; // Invalid: missing 'on' prefix
  onClicked: () => void; // Invalid: past tense ending (default setting)
}

// Button is a React Component, so ButtonProps interface is checked
const Button = ({ refetch }: ButtonProps) => {
  return null;
}
```

### ✅ Correct

```typescript
interface ButtonProps {
  onClick: () => void;
  onSubmit: () => void;
  onRefetch: () => void; // Valid: Starts with "on", fully supports custom events!
  title: string; // Non-function props are safely ignored
}

const Button = ({ onClick, title }: ButtonProps) => {
  return <button onClick={onClick}>{title}</button>;
}
```

### ✅ Ignored (Not used as Component props)

```typescript
interface HelperProps {
  refetch: () => void;
}

// Since there is no React Component using HelperProps, the rule ignores it entirely
export const helper = (args: HelperProps) => {
  args.refetch();
};
```

## Configuration Options

This rule can be configured via an options object:

```typescript
// .eslintrc.cjs / eslint.config.js
rules: {
  'eg-rules/component-callback-naming': ['error', {
    allowPastTense: false,
    blacklist: ["Finished", "Done"],
    whitelist: ["Proceed", "Agreed"]
  }]
}
```

### `allowPastTense` (default: `false`)

When `false`, this rule enforces that common event names do not end in past tense (i.e., `onClicked`, `onThatChanged` is invalid). Instead, you should stick to present tense base events like `onClick` or `onChange`.

When set to `true`, the rule permits callback properties to end with past-tense variants of standard React events.

```typescript
// Valid when { allowPastTense: true }
interface FormProps {
  onFormSubmitted: () => void;
  onButtonClicked: () => void;
}
```

### `blacklist` (default: `[]`)

An array of strings defining suffixes that are explicitly forbidden. Even if `allowPastTense` is true or the event starts with `"on"`, if it ends with a string in this list, it will emit an error.

```typescript
// Invalid when { blacklist: ['Finished'] }
interface TaskProps {
  onTaskFinished: () => void; // Invalid: Ends with a blacklisted suffix 'Finished'
}
```

### `whitelist` (default: `[]`)

An array of strings defining suffixes that are explicitly allowed, bypassing other checks like past tense restrictions.

```typescript
// Valid when { whitelist: ['Agreed'] }, even though "Agreed" is a past tense word
interface TermsProps {
  onAgreed: () => void; // Valid: Bypasses past tense checks because it is explicitly whitelisted
}
```
