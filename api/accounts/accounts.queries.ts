import { Account, database } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { accountsKeys } from "../queryKeys";
import { toast } from "@backpackapp-io/react-native-toast";

export const useGetAllAccounts = () => {
  return useQuery<Account[], Error>({
    queryKey: accountsKeys.lists(),
    queryFn: async () => await database.accounts.getAll(),
    meta: {
      onError: (error: Error) => {
        toast.error("Failed to load accounts.");

        console.error(error);
      },
    },
  });
};

export const useGetAllAccountsBalance = () => {
  return useQuery<number, Error>({
    queryKey: accountsKeys.list({ aggregate: "balance" }),
    queryFn: async () => await database.accounts.getTotalBalance(),
    meta: {
      onError: (error: Error) => {
        toast.error("Failed to load all accounts balance.");

        console.error(error);
      },
    },
  });
};
