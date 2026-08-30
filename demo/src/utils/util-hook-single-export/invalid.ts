// ❌ Invalid: Multiple exported functions violate Single Responsibility
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const getDayDiff = (a: Date, b: Date): number => {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 3600 * 24);
};
