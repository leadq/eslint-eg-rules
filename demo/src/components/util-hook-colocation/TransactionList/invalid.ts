// ❌ Invalid: Sibling component importing private local util from AccountDetail
import { formatAccountNumber } from '../AccountDetail/utils/formatAccountNumber';

export const TransactionList = () => {
  return formatAccountNumber('987654321');
};
