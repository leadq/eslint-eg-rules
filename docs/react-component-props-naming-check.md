# react-component-props-naming-check

## Kural Tanımı ve Amacı

Bu kural, React component fonksiyonlarına geçilen props tipinin `{ComponentName}Props` adlandırma konvansiyonuna uygunluğunu doğrular.

Kural yalnızca gerçekten JSX döndüren (yani `returnsJSX` kontrolünden geçen) PascalCase fonksiyonlara uygulanır; bu sayede hook, event handler ve render yardımcı fonksiyonlarıyla ilgili false positive üretilmez. function, arrow function, React.memo ve React.forwardRef sarmalayıcıları dahil tüm yaygın component tanımlama biçimleri desteklenir.

Hedef dosyalar: `.tsx` (test dosyaları ve `apis/` index dosyaları hariç)

Hata Mesajı Deseni:
```text
Component `{ComponentName}` props tipi `{ActualType}` yerine `{ComponentName}Props` olmalı.
```

---

## Geçersiz Durumlar

❌ Props tipi `{ComponentName}Props` pattern'ine uymayan isimle tanımlanmış:
```tsx
interface LoginData { username: string }

function Login(props: LoginData) {    // LoginData -> LoginProps olmalı
  return <form>{props.username}</form>;
}
```

❌ Arrow function component:
```tsx
interface ButtonSettings { label: string }

const ActionButton = (props: ButtonSettings) => { // ButtonSettings -> ActionButtonProps olmalı
  return <button>{props.label}</button>;
};
```

❌ React.memo sarmalayıcısı:
```tsx
interface CardData { title: string }

const Card = React.memo((props: CardData) => { // CardData -> CardProps olmalı
  return <div>{props.title}</div>;
});
```

❌ React.forwardRef sarmalayıcısı:
```tsx
interface InputOptions { value: string }

const Input = React.forwardRef<HTMLInputElement, InputOptions>((props, ref) => {
  return <input ref={ref} value={props.value} />; // InputOptions -> InputProps olmalı
});
```

---

## Geçerli Durumlar

✅ Tam uyumlu isim:
```tsx
interface LoginProps { username: string }

function Login(props: LoginProps) {
  return <form>{props.username}</form>;
}
```

✅ `PropsWithChildren<{ComponentName}Props>` wrapper:
```tsx
interface CardProps { title: string }

const Card = (props: PropsWithChildren<CardProps>) => {
  return <div><h2>{props.title}</h2>{props.children}</div>;
};
```

✅ Intersection — primary tip `{ComponentName}Props` ise geçerli:
```tsx
interface LoginProps { onLogin: () => void }

const Login = (props: LoginProps & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};
```

✅ Props parametresi olmayan component:
```tsx
const Header = () => <header>Site Header</header>;
```

✅ Yalnızca built-in HTML attribute tipi kullanan component:
```tsx
const Wrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};
```

---

## Ignore Durumları

⚠️ Inline object tipi — farklı kural kapsamında değerlendirilir, bu kural atlar:
```tsx
const Badge = ({ text }: { text: string }) => <span>{text}</span>;
```

⚠️ Hook fonksiyonu — `useXxx` pattern'i component değil:
```tsx
const useAuth = (config: AuthConfig) => ({ isLoggedIn: true });
```

⚠️ camelCase fonksiyon — component değil:
```tsx
const validateForm = (state: FormState) => state.email.includes('@');
```

⚠️ renderX prefix — render yardımcı fonksiyonu, component değil:
```tsx
const renderListItem = (item: ItemData) => <li>{item.label}</li>;
```

⚠️ JSX döndürmeyen PascalCase fonksiyon — `returnsJSX` kontrolünden geçemez:
```tsx
const createService = (config: ServiceConfig): Service => new Service();
```

⚠️ Test dosyaları (`.test.tsx`, `__tests__/`) — tamamen atlanır.

---

## Edge Case'ler

| Senaryo | Davranış |
| :--- | :--- |
| Props parametresi yok `const X = () => <div />` | ✅ Geçerli — atlanır |
| Tip annotation yok `const X = (props) => <div />` | ✅ Atlanır (farklı kural) |
| `PropsWithChildren<XProps>` — iç tip doğru | ✅ Geçerli |
| `PropsWithChildren<SomeOtherType>` — iç tip yanlış | ❌ İhlal |
| `XProps & HTMLAttributes<div>` intersection | ✅ Geçerli (primary tip eşleşiyor) |
| `LoginData & SomeData` intersection (hiçbiri eşleşmiyor) | ❌ İhlal |
| `ComponentProps<typeof Button>` utility tipi | ✅ Atlanır |
| `ButtonHTMLAttributes<HTMLButtonElement>` | ✅ Atlanır (built-in) |
| `React.forwardRef<Ref, Props>` -> genelleştirme parametresi | ✅ Inner function kontrolü yapılır |
| `React.memo(() => <div />)` | ✅ Inner function kontrolü yapılır |
