export function renderButton() {
  return <button>Click</button>;
}

export const renderLabel = () => <span>Label</span>;

export function isReady() {
  return true;
}

export const hasError = () => false;

export function getSum() {
  return 1 + 2;
}

export const determineState = () => ({ status: 'ok' });

export function MyComponent() {
  return <div>Component</div>;
}

export function useData() {
  return [1, 2];
}

export function onClick() {
  return true;
}
