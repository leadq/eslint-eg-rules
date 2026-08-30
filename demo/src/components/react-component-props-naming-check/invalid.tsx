import React, { type PropsWithChildren } from 'react';

// ❌ 1. FunctionDeclaration with mismatched prop type (LoginData instead of LoginProps)
interface LoginData {
  username: string;
}

export function Login(props: LoginData) {
  return <form>{props.username}</form>;
}

// ❌ 2. Arrow function component with mismatched prop type (ButtonSettings instead of ActionButtonProps)
interface ButtonSettings {
  label: string;
}

export const ActionButton = (props: ButtonSettings) => {
  return <button>{props.label}</button>;
};

// ❌ 3. React.memo wrapper with mismatched prop type (CardData instead of CardProps)
interface CardData {
  title: string;
}

export const Card = React.memo((props: CardData) => {
  return <div>{props.title}</div>;
});

// ❌ 4. React.forwardRef with mismatched generic prop type (InputOptions instead of InputProps)
interface InputOptions {
  value: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputOptions>((props, ref) => {
  return <input ref={ref} value={props.value} />;
});

// ❌ 5. PropsWithChildren with mismatched inner prop type
export const ChildCard = (props: PropsWithChildren<CardData>) => {
  return <div>{props.children}</div>;
};

// ❌ 6. Intersection with mismatched custom prop type
export const Dialog = (props: LoginData & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};
