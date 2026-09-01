# Enforce single component export per component file (`react-export-single-component-check`)

This rule enforces that each React component file exports at most one React component. Exporting multiple components from the same file violates Single Responsibility and makes component organization difficult.

## Rule Details

This rule checks named exports (`export function`, `export const`, `export { LocalComp }`) in `.tsx` files. It ignores `index.tsx` (barrel files), `main.tsx`, `App.tsx`, test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`), and storybook files (`*.stories.tsx`).

### Examples

👎 Examples of **incorrect** code:

```tsx
// ❌ Multiple function components exported in the same file
export function PrimaryButton({ label }: { label: string }) {
  return <button className="primary">{label}</button>;
}

export function SecondaryButton({ label }: { label: string }) {
  return <button className="secondary">{label}</button>;
}
```

```tsx
// ❌ Arrow function component exported as second component
export function Card() {
  return <div className="card" />;
}

export const CardFooter = () => <footer />;
```

```tsx
// ❌ Multiple local components exported via export { A, B }
const Header = () => <header />;
const Footer = () => <footer />;

export { Header, Footer };
```

```tsx
// ❌ Compound sub-component exported separately
export function Accordion() { return <div />; }
export function AccordionItem() { return <li />; }
Accordion.Item = AccordionItem;
```

👍 Examples of **correct** code:

```tsx
// ✅ Single component exported
export function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

```tsx
// ✅ Single component with camelCase helper function
export function formatLabel(text: string) {
  return text.trim();
}

export function Badge({ text }: { text: string }) {
  return <span>{formatLabel(text)}</span>;
}
```

```tsx
// ✅ Single component with type, constant, or enum exports
export type ButtonProps = { label: string };
export const DEFAULT_VARIANT = 'primary';

export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
```

```tsx
// ✅ Single component wrapped with React.memo, React.forwardRef, or React.lazy
export const MemoButton = React.memo(({ label }: { label: string }) => (
  <button>{label}</button>
));
```

```tsx
// ✅ Compound component pattern (subcomponent assigned to parent property, not exported)
export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}

function AccordionItem({ label }: ItemProps) {
  return <li>{label}</li>;
}

Accordion.Item = AccordionItem;
```

```tsx
// ✅ Single component with exported custom hook and util
export function useAccordionState(defaultOpen: boolean) {
  const [open, setOpen] = React.useState(defaultOpen);
  return { open, setOpen };
}

export function normalizeLabel(label: string) {
  return label.trim().toLowerCase();
}

export function Accordion({ label }: AccordionProps) {
  const { open } = useAccordionState(false);
  return <div aria-expanded={open}>{normalizeLabel(label)}</div>;
}
```

### Ignored Cases

- Barrel files (`index.tsx`), App entry points (`main.tsx`, `App.tsx`)
- Test files (`*.test.tsx`, `*.spec.tsx`, `__tests__/`) and storybook files (`*.stories.tsx`)
- Non-TSX files (`.ts`, `.js`, etc.)
- Re-exports from external modules (`export { Button } from './button'`)
- Imported and re-exported symbols (`import { X } from './file'; export { X }`)
- Default exports (`export default function MyComponent() ...`)
- Non-component exports (types, interfaces, enums, UPPER_CASE / camelCase constants, non-function constants)
