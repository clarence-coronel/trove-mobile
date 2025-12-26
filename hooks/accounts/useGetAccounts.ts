import { useEffect, useState } from "react";
import { Q } from "@nozbe/watermelondb";
import Account from "@/lib/dbv2/model/Account";
import { watermelonDB } from "@/lib/dbv2";

export function useGetAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const collection = watermelonDB.get<Account>("accounts");

    const query = collection.query();

    // Q.sortBy("name", Q.asc)

    try {
      const subscription = query.observe().subscribe({
        next: (latestAccounts) => {
          setAccounts(latestAccounts);
          setIsLoading(false);
        },
        error: (err) => {
          setError(err);
          setIsLoading(false);
        },
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  return { accounts, isLoading, error };
}
