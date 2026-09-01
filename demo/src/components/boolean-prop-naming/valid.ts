export interface ButtonProps {
  isActive: boolean;
  hasIcon?: boolean;
  areColumnsDraggable?: boolean;
  haveAccess?: boolean;
}

export function useButton(isReady: boolean = false) {}

export type UtilOptions = {
  canExecute: boolean;
  areItemsSelected?: boolean;
};
