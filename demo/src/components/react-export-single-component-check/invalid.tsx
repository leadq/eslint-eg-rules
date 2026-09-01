import React from 'react';

// 1. First component is allowed
export function PrimaryButton({ label }: { label: string }) {
  return <button className="primary">{label}</button>;
}

// ❌ 2. Second function component triggers error
export function SecondaryButton({ label }: { label: string }) {
  return <button className="secondary">{label}</button>;
}

// ❌ 3. Arrow function component triggers error
export const ActionButton = ({ label }: { label: string }) => {
  return <button className="action">{label}</button>;
};

// ❌ 4. React.memo component triggers error
export const MemoizedButton = React.memo(({ label }: { label: string }) => {
  return <button>{label}</button>;
});

const InternalHeader = () => <header>Internal Header</header>;
const InternalFooter = () => <footer>Internal Footer</footer>;

// ❌ 5. Local re-export of multiple components triggers error
export { InternalHeader, InternalFooter };
