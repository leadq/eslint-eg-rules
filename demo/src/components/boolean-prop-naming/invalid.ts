export interface ButtonProps {
  active: boolean; // ❌ missing boolean prefix
  loading?: boolean; // ❌ missing boolean prefix
}

export function useButton(ready: boolean = false) {} // ❌ missing boolean prefix

export type UtilOptions = {
  execute: boolean; // ❌ missing boolean prefix
};
