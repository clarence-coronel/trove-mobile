import { useCallback, useState } from "react";
import { watermelonDB } from "@/lib/dbv2";
import Account from "@/lib/dbv2/model/Account";
import Toast from "react-native-toast-message";

export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAccount = useCallback(
    async (accountId: string): Promise<boolean> => {
      setIsPending(true);
      setError(null);

      try {
        const collection = watermelonDB.get<Account>("accounts");
        const account = await collection.find(accountId);

        await watermelonDB.write(async () => {
          await account.markAsDeleted();
        });

        Toast.show({
          type: "success",
          text1: "Account deleted successfully",
        });

        return true;
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Failed to delete account",
        });

        setError(err as Error);
        return false;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { deleteAccount, isPending, error };
}
