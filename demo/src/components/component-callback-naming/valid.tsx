import { type FC } from 'react';

interface ButtonProps {
  onClick: () => void;
  onSubmit: () => Promise<void>;
  onRefetch: () => void; // completely valid custom event starting with "on"
  name: string; // Not a function, so it's ignored
}

// Proves valid case: "on + Event" format passes
export const Button: FC<ButtonProps> = ({ onClick, name }) => {
  return <button onClick={onClick}>{name}</button>;
};

interface IgnoreProps {
  refetch: () => void;
}

// Proves non-component ignores the interface check
const normalFunction = (props: IgnoreProps) => {
  return null;
};
