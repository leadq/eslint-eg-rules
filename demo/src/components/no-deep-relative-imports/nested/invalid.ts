// ❌ Invalid: 3 levels up traversal exceeds maxDepth (2)
import { getFormattedCurrency } from '../../../utils/no-upstream-imports/valid';

export const calculateTax = (amount: number): string => {
  return getFormattedCurrency(amount);
};
