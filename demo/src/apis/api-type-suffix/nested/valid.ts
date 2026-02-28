// These interfaces should pass the api-type-suffix rule without any errors.
// Proves that the rule scans deep nested directories correctly.

export type GlobalResponse = {
  result: boolean;
};
