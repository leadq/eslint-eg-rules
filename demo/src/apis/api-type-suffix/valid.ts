// These interfaces should pass the api-type-suffix rule without any errors.

// Standard usage of Model suffix
export interface UserModel {
  id: string;
  name: string;
}

// Standard usage of Request suffix
export interface UserRequest {
  query: string;
}

// Interacting correctly with valid suffix words not being consecutive
export interface RequestHelperModel {
  helperId: string;
}
