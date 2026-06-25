// This file is in a NON-TARGET path (src/components/).
// Proves that the rule ignores everything here, even if it violates the `src/apis` suffix rules.

export interface ComponentProps {
  children: React.ReactNode;
}

export type BadSuffixNameDTODataEntity = {
  active: boolean;
};
