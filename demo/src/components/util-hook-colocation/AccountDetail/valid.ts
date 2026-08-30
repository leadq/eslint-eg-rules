// ✅ Valid: Component importing from its own local utils
import { formatAccountNumber } from './utils/formatAccountNumber';

export const AccountDetail = () => {
  return formatAccountNumber('123456789');
};
