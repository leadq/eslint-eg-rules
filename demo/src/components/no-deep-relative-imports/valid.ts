// ✅ Valid: Relative import with depth <= 2
import { getFormattedCurrency } from '../../utils/no-upstream-imports/valid';

export const calculateDiscount = (val: number): string => {
  return getFormattedCurrency(val);
};
