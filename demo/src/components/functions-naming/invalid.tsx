export function awesomeButton() {
  return <button>Click</button>; // Should error, missing render prefix
}

export const myLabel = () => <span>Label</span>; // Should error, missing render prefix

export function checkReady() {
  return true; // Should error, missing boolean prefix (is/has/can/will)
}

export const readyState = () => false; // Should error, missing boolean prefix

export function fetchSum() {
  return 1 + 2; // Should error, missing value prefix (get/calculate/determine)
}

export const computeState = () => ({ status: 'ok' }); // Should error, missing value prefix
