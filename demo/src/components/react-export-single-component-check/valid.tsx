import React, { useState } from 'react';

// ✅ Type, interface, enum, and constants are allowed alongside the component
export type UserStatus = 'active' | 'inactive';
export interface UserCardProps {
  name: string;
  email: string;
  isStatusActive?: boolean;
}
export const DEFAULT_STATUS: UserStatus = 'active';

// ✅ Exported custom hook is allowed (starts with lowercase 'u')
export function useCardState(isInitialOpen = false) {
  const [isOpen, setIsOpen] = useState(isInitialOpen);
  return { isOpen, setIsOpen };
}

// ✅ Exported camelCase util function is allowed (named according to functions-naming)
export function getFormattedUserEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ✅ The ONLY exported component in this file
export function UserCard({ name, email, isStatusActive = true }: UserCardProps) {
  const { isOpen, setIsOpen } = useCardState(false);

  return (
    <div className="userCard">
      <h3>{name}</h3>
      <p>{getFormattedUserEmail(email)}</p>
      <span>{isStatusActive ? 'Active' : 'Inactive'}</span>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle ({isOpen ? 'Open' : 'Closed'})</button>
    </div>
  );
}

// ✅ Internal (unexported) subcomponents for compound component pattern are allowed
function UserCardBadge({ label }: { label: string }) {
  return <span className="badge">{label}</span>;
}

UserCard.Badge = UserCardBadge;
