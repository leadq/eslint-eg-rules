/* eslint-disable strict-eg-rulez/util-hook-single-export, strict-eg-rulez/functions-naming */
// ✅ Valid: Shared util importing another shared util (same layer)
export const getFormattedCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
