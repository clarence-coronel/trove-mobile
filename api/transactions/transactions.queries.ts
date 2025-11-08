import { database, Transaction, TransactionType } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { transactionsKeys } from "../queryKeys";

import Toast from "react-native-toast-message";

export const useGetAllTransactions = () => {
  return useQuery<Transaction[], Error>({
    queryKey: transactionsKeys.lists(),
    queryFn: async () => await database.transactions.getAll(),
    meta: {
      onError: (error: Error) => {
        Toast.show({
          type: "success",
          text1: "Failed to load transactions.",
        });

        console.error(error);
      },
    },
  });
};

export const useGetAllTransactionsByType = (type: TransactionType) => {
  return useQuery<Transaction[], Error>({
    queryKey: transactionsKeys.list({ type }),
    queryFn: async () => await database.transactions.getByType(type),
    meta: {
      onError: (error: Error) => {
        Toast.show({
          type: "error",
          text1: `Failed to load ${
            type === "EARNING" ? "earning" : "expense"
          } transactions.`,
        });

        console.error(error);
      },
    },
  });
};
