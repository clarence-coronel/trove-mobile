import { useCallback, useState } from "react";
import { watermelonDB } from "@/lib/dbv2";
import Account, { AccountType } from "@/lib/dbv2/model/Account";
import Toast from "react-native-toast-message";

export interface UpdateAccountInput {
  name?: string;
  provider?: string;
  type?: AccountType;
  color?: string;
  isActive?: boolean;
}

export function useUpdateAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAccount = useCallback(
    async (
      accountId: string,
      accountData: UpdateAccountInput
    ): Promise<Account | null> => {
      setIsPending(true);
      setError(null);

      try {
        const collection = watermelonDB.get<Account>("accounts");
        const account = await collection.find(accountId);

        let updatedAccount: Account | null = null;

        await watermelonDB.write(async () => {
          updatedAccount = await account.update((acc) => {
            Object.assign(acc, accountData);
          });
        });

        Toast.show({
          type: "success",
          text1: "Account updated successfully",
        });

        return updatedAccount;
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Failed to update account",
        });

        setError(err as Error);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { updateAccount, isPending, error };
}
