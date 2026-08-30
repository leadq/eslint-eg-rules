import React, { type PropsWithChildren } from 'react';

// ✅ 1. Standard matching ComponentNameProps
interface LoginProps {
  username: string;
}

export function Login(props: LoginProps) {
  return <form>{props.username}</form>;
}

// ✅ 2. Arrow function with matching ActionButtonProps
interface ActionButtonProps {
  label: string;
}

export const ActionButton = (props: ActionButtonProps) => {
  return <button>{props.label}</button>;
};

// ✅ 3. PropsWithChildren wrapper
interface CardProps {
  title: string;
}

export const Card = (props: PropsWithChildren<CardProps>) => {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
};

// ✅ 4. Intersection with built-in HTMLAttributes
interface ModalProps {
  isOpen: boolean;
}

export const Modal = (props: ModalProps & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};

// ✅ 5. No props component
export const Header = () => <header>Site Header</header>;

// ✅ 6. Built-in HTML attribute only
export const Wrapper = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props} />;
};

// ✅ 7. Inline object props (ignored by this rule)
export const Badge = ({ text }: { text: string }) => <span>{text}</span>;

// ✅ 8. React.memo with matching MemoCardProps
interface MemoCardProps {
  title: string;
}

export const MemoCard = React.memo((props: MemoCardProps) => {
  return <div>{props.title}</div>;
});

// ✅ 9. React.forwardRef with matching InputProps
interface InputProps {
  value: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} value={props.value} />;
});
