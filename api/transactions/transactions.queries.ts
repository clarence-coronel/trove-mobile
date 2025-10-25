import { database, Transaction } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { transactionsKeys } from "../queryKeys";
import { toast } from "@backpackapp-io/react-native-toast";

export const useGetAllTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: transactionsKeys.lists(),
    queryFn: async () => await database.transactions.getAll(),
    meta: {
      onError: (error: Error) => {
        console.error(error);
        toast.error("Failed to load transactions");
      },
    },
  });
};
