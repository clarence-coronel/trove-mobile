export type AccountType = "SAVINGS" | "CHECKING" | "E-WALLET" | "CASH";
export type TransactionType = "EXPENSE" | "EARNING";

export interface Account {
  id: string;
  provider: string;
  nickname: string | null;
  balance: number;
  accountName: string;
  type: AccountType;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  datetime: string;
  accountId: string;
  account: Account | null;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export type NewAccount = Omit<Account, "id" | "createdAt" | "updatedAt">;
export type NewTransaction = Omit<
  Transaction,
  "id" | "datetime" | "createdAt" | "updatedAt" | "account"
> & {
  datetime?: string;
};
