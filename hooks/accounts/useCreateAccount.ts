import { useCallback, useState } from "react";
import { watermelonDB } from "@/lib/dbv2";
import Account from "@/lib/dbv2/model/Account";

export interface NewAccountInput {
  name: string;
  provider: string;
  type: string;
  initialBalance: number;
  color?: string;
}

export function useCreateAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAccount = useCallback(
    async (accountData: NewAccountInput): Promise<Account | null> => {
      setIsPending(true);
      setError(null);

      try {
        const collection = watermelonDB.get<Account>("accounts");

        let newAccount: Account | null = null;

        await watermelonDB.write(async () => {
          newAccount = await collection.create((account) => {
            account.name = accountData.name;
            account.provider = accountData.provider;
            account.type = accountData.type;
            account.initialBalance = accountData.initialBalance;
            if (accountData.color) account.color = accountData.color;
          });
        });

        return newAccount!;
      } catch (err) {
        setError(err as Error);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { createAccount, isPending, error };
}
