// This is in the apis folder, so the rule should completely ignore it
// even though the boolean properties are missing prefixes.

export interface ApiModel {
  active: boolean;
  loading?: boolean;
}

export function checkApi(ready: boolean = false) {}

export type ApiOptionsRequest = {
  execute: boolean;
};
