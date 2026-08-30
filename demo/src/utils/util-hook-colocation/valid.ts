// ✅ Non-target path: Global utils importing another global util is completely valid
export const valid = (str: string): string => {
  return str.trim();
};
