// These interfaces should fail the api-type-suffix rule.

// INVALID: Doesn't end with Model, Request, or Response. Proves rule detects invalid ending.
export interface UserData {
  id: string;
}

// INVALID: Consecutive suffixes Strategy -> user + Request + Model -> RequestModel
// Proves rule flags consecutive target suffixes incorrectly used together
export interface UserRequestModel {
  query: string;
}

// INVALID: Case sensitivity check. 'Dto' is not allowed, 'Model' should be exact.
export type UserDto = {
  data: string;
};
