// These interfaces should fail the api-type-suffix rule.
// Proves that the rule scans deep nested directories correctly.

export interface SettingsDTO {
  theme: string;
}
