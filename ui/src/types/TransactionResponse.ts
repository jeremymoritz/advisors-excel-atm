import { Account } from './Account';

export type TransactionResponse = Omit<Account, 'accountNumber' | 'creditLimit'> & {
  account_number: number;
  credit_limit: number | null;
};
