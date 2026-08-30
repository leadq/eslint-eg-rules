// ✅ Valid: Single exported function matching file name in utils folder
export const valid = (date: Date): string => {
  return date.toISOString();
};
