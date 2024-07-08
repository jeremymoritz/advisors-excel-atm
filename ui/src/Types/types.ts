export type Account = {
  accountNumber: number;
  name: string;
  amount: number;
  type: string;
  creditLimit: number | null;
};

export type TransactionResponse = {
  account_number: number;
  name: string;
  amount: number;
  type: string;
  credit_limit: number | null;
};
