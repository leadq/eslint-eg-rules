// ✅ Local util private to AccountDetail component
export const formatAccountNumber = (account: string): string => {
  return `***-${account.slice(-4)}`;
};
