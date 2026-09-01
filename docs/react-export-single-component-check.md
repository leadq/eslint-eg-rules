# react-export-single-component-check

## Kural Tanımı ve Amacı

Bu kural, her component dosyasında yalnızca tek bir React component export edilebileceğini denetler. Aynı dosyadan birden fazla component export edilmesi, dosya sorumluluğunu (single responsibility) ihlal eder ve bileşen organizasyonunu zorlaştırır.

Kural; `export function`, `export const` (arrow function veya `React.memo` / `forwardRef` / `lazy` wrapper) ve `export { LocalComp }` (local re-export) desenlerini kapsar.

Hedef dosyalar: `.tsx`
Atlanan dosyalar: `index.tsx`, `main.tsx`, `App.tsx`, test dosyaları (`.test.tsx`, `.spec.tsx`, `__tests__/`), storybook dosyaları (`.stories.tsx`)

Hata Mesajı Deseni:
```text
Bir component dosyasında yalnızca tek bir component export edilebilir. `<ComponentAdı>` fazladan export edilmiş.
```

---

## Geçersiz Durumlar

❌ Aynı dosyada iki function component export edilmiş:
```tsx
export function PrimaryButton({ label }: { label: string }) {
  return <button className="primary">{label}</button>;
}

// ❌ Hata: PrimaryButton zaten export edildi
export function SecondaryButton({ label }: { label: string }) {
  return <button className="secondary">{label}</button>;
}
```

❌ Arrow function ile ikinci component export edilmiş:
```tsx
export function Card() {
  return <div className="card" />;
}

// ❌ Hata: Card zaten export edildi
export const CardFooter = () => <footer />;
```

❌ `export { A, B }` ile birden fazla local component export edilmiş:
```tsx
const Header = () => <header />;
const Footer = () => <footer />;

// ❌ Hata: Footer fazladan export
export { Header, Footer };
```

---

## Geçerli Durumlar

✅ Dosyada yalnızca bir component export edilmiş:
```tsx
export function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

✅ Tek component ile birlikte yardımcı (camelCase) fonksiyon export edilebilir — `isComponentName` kontrolü sayesinde PascalCase olmayan exportlar sayılmaz:
```tsx
export function formatLabel(text: string) {
  return text.trim();
}

export function Badge({ text }: { text: string }) {
  return <span>{formatLabel(text)}</span>;
}
```

✅ Tek component ile birlikte type, interface, enum veya sabit değişken export edilebilir:
```tsx
export type ButtonProps = { label: string };
export const DEFAULT_VARIANT = 'primary';

export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
```

✅ `React.memo`, `React.forwardRef`, `React.lazy` ile wrap edilmiş tek component:
```tsx
export const MemoButton = React.memo(({ label }: { label: string }) => (
  <button>{label}</button>
));
```

---

## Ignore Durumları

⚠️ `export { X } from './other'` yapısı — başka dosyadan gelen re-export, `moduleSpecifier` mevcuttur, sayılmaz:
```tsx
export { Button as AliasButton } from './button';
export { Card } from './card';
```

⚠️ `export default` — `typescript-export-default-check` kuralı tarafından ele alındığından bu kural tarafından sayılmaz:
```tsx
export default function MyComponent() {
  return <div />;
}
```

---

## Edge Case'ler

| Durum | Davranış |
| :--- | :--- |
| `index.tsx` | Barrel export dosyası sayılır, kural uygulanmaz |
| `main.tsx`, `App.tsx` | Uygulama giriş noktası, atlanır |
| `*.test.tsx`, `*.spec.tsx`, `__tests__/` | Test dosyaları, atlanır |
| `*.stories.tsx` | Storybook dosyaları, atlanır |
| `export type Foo` / `export interface Foo` | Type-level export, sayılmaz |
| `export enum Foo` | Enum export, sayılmaz (PascalCase ama function değil) |
| `export const DEFAULT_VALUE = 'x'` | camelCase/UPPER_CASE, sayılmaz |
| `export const MyConst = 42` | PascalCase sabit ama initializer arrow/function değil, sayılmaz |
| `export const Wrapped = React.memo(...)` | HOC wrapper, component olarak sayılır |
| `export { Local }` (local, from yok) | Local re-export, sayılır |
| `export { Ext } from './file'` | Dış re-export (`from` mevcut), sayılmaz |
| `import { X } from './file'; export { X }` | Import edilip re-export edilen, sayılmaz |

---

## Compound Component Senaryosu

Compound component'lerde sub-component'ler export edilmeden parent'a property olarak atanmalıdır. Bu durumda kural doğru çalışır:

✅ Yalnızca parent export edilmiş, sub-component property olarak atanmış:
```tsx
// ✅ Geçerli - AccordionItem export edilmiyor, property olarak ekleniyor
export function Accordion({ children }: AccordionProps) {
  return <div>{children}</div>;
}

function AccordionItem({ label }: ItemProps) {
  return <li>{label}</li>;
}

Accordion.Item = AccordionItem; // export yok, sadece property assignment
```

❌ Sub-component ayrıca export edilmişse kural ihlali oluşur:
```tsx
export function Accordion() { return <div />; }

// ❌ Hata: AccordionItem zaten Accordion.Item olarak erişilebilir,
// ayrıca export etmek gerekmez - kendi dosyasına taşınmalı
export function AccordionItem() { return <li />; }

Accordion.Item = AccordionItem;
```

---

## Hook ve Util ile Birlikte Kullanım

`export function useXxx()` şeklindeki hook tanımları `isComponentName` kontrolünde `false` döner (`u` ile başladığından PascalCase sayılmaz). `camelCase` util fonksiyonları da aynı şekilde sayılmaz. Bu nedenle aşağıdaki yapı geçerlidir:

✅ Tek component + hook + util aynı dosyada olabilir:
```tsx
// ✅ Geçerli - hook ve util sayılmaz, yalnızca bir component export edilmiş

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
