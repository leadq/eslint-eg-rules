/* eslint-disable strict-eg-rulez/functions-naming */
// ✅ Valid non-target path: Component importing from shared utils layer
import { getFormattedCurrency } from '../../utils/no-upstream-imports/valid';

export const getPrice = (price: number): string => {
  return getFormattedCurrency(price);
};
