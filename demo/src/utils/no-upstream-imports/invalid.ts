// ❌ Invalid: Shared util importing from UI components layer
import { Button } from '../../components/boolean-prop-naming/valid';

export const getUserButton = (): string => {
  return Button ? 'btn' : 'none';
};
